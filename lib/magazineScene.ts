/*
 * 매거진 3D 장면. React와 분리된 순수 three.js 클래스다.
 *
 * 좌표계: 책등(제본선)이 원점, 책은 XY 평면에 눕고 +Z가 보는 사람 쪽이다.
 * 오른쪽 더미는 x ∈ [0, PW], 왼쪽 더미는 x ∈ [-PW, 0].
 * 낱장(sheet) i의 앞면은 (2i+1)쪽, 뒷면은 (2i+2)쪽이다.
 *
 * 넘김은 종이 길이를 보존하는 곡선으로 그린다. 책등에서 끝까지 잘게 나눈 조각마다
 * 각도 φ를 주고 cos/sin을 누적하므로 종이가 늘어나지 않고 휘기만 한다.
 */
import * as THREE from "three";

export type ViewerPhase = "intro" | "reading";
export type ViewerFocus = "left" | "right";

export type ViewerState = {
  phase: ViewerPhase;
  /** 왼쪽으로 넘어간 낱장 수 (0 = 닫힌 앞표지, sheets = 뒤표지) */
  flipped: number;
  /** 좁은 화면에서 한 쪽만 크게 볼 때 어느 쪽을 보는지 */
  focus: ViewerFocus;
  single: boolean;
  ready: boolean;
};

type Options = {
  canvas: HTMLCanvasElement;
  pageCount: number;
  pageAspect: number; // height / width
  pageSrc: (page: number) => string;
  background: number;
  reducedMotion: boolean;
  onState: (s: ViewerState) => void;
};

type Turn = {
  s: number; // 움직이는 낱장
  t: number; // 0 = 오른쪽에 누움, 1 = 왼쪽에 누움
  dir: 1 | -1; // 1 = 앞으로(오른쪽→왼쪽), -1 = 뒤로
  curl: number;
  diag: number; // 아래 모서리를 먼저 들어 올리는 정도 (-1..1)
};

type Tween = {
  from: number;
  to: number;
  start: number;
  duration: number;
  done: () => void;
};

const PW = 1;
const SEG_X = 56;
const SEG_Y = 10;
const SHEET = 0.0016; // 낱장 두께 (페이지 폭 1 기준, 115mm 기준 약 0.18mm)
const READING_TILT = -0.07;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export class MagazineScene {
  private o: Options;
  private PH: number;
  private sheets: number;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  private pivot = new THREE.Group();
  private inner = new THREE.Group();
  private sun: THREE.DirectionalLight;
  private floor: THREE.Mesh;

  private textures = new Map<number, THREE.Texture>();
  private loading = new Set<number>();
  private wanted = new Map<THREE.MeshStandardMaterial, number>();
  private loader = new THREE.TextureLoader();

  private stackR: THREE.Mesh;
  private stackL: THREE.Mesh;
  private stackMatR: THREE.MeshStandardMaterial;
  private stackMatL: THREE.MeshStandardMaterial;
  private stackUniR = { value: 1 };
  private stackUniL = { value: 1 };
  private topR: THREE.Mesh;
  private topL: THREE.Mesh;
  private botR: THREE.Mesh;
  private botL: THREE.Mesh;
  private sheetFront: THREE.Mesh;
  private sheetBack: THREE.Mesh;
  private sheetGeoF: THREE.BufferGeometry;
  private sheetGeoB: THREE.BufferGeometry;
  private sheetPos: Float32Array;

  // state
  private phase: ViewerPhase = "intro";
  private flipped = 0;
  private focus: ViewerFocus = "right";
  private single = false;
  private turn: Turn | null = null;
  private turnTween: Tween | null = null;
  private queue: Array<() => void> = [];
  private pose = 0; // 0 = intro, 1 = reading
  private poseFrom = 0;
  private poseTo = 0;
  private poseStart = 0;
  private poseDuration = 1100;

  private userYaw = 0;
  private userPitch = 0;
  private userYawVel = 0;
  private camPos = new THREE.Vector3(0, 0, 6);
  private camTarget = new THREE.Vector3();
  private camInit = false;
  private width = 1;
  private height = 1;
  private raf = 0;
  private last = 0;
  private time = 0;
  private dirty = true;
  private disposed = false;
  private onReady = false;

  // pointer
  private ptr: {
    id: number;
    x0: number;
    y0: number;
    lx0: number;
    ly0: number;
    lastX: number;
    lastT: number;
    vx: number;
    mode: "none" | "orbit" | "turn" | "swipe";
    dir: 1 | -1;
    moved: boolean;
  } | null = null;
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private plane = new THREE.Plane();

  constructor(o: Options) {
    this.o = o;
    this.PH = o.pageAspect;
    this.sheets = Math.ceil(o.pageCount / 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: o.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(o.background, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color(o.background);

    // 빛: 위쪽 왼편에서 비스듬히 들어오는 창가 빛 + 부드러운 주변광
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d9d9, 1.55);
    this.scene.add(hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.5);
    this.sun.position.set(-1.6, 2.4, 4.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = -2.4;
    sc.right = 2.4;
    sc.top = 2.4;
    sc.bottom = -2.4;
    sc.near = 0.5;
    sc.far = 12;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.004;
    this.sun.shadow.radius = 5;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    // 그림자를 받는 뒷면(테이블)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.2, depthWrite: false }),
    );
    floor.position.z = -0.09;
    floor.receiveShadow = true;
    floor.renderOrder = -1;
    this.floor = floor;
    this.scene.add(floor);

    this.scene.add(this.pivot);
    this.pivot.add(this.inner);

    // 종이 더미
    const stackGeo = new THREE.BoxGeometry(PW, this.PH, 1);
    this.stackMatR = this.makeEdgeMaterial(this.stackUniR);
    this.stackMatL = this.makeEdgeMaterial(this.stackUniL);
    this.stackR = new THREE.Mesh(stackGeo, this.stackMatR);
    this.stackL = new THREE.Mesh(stackGeo, this.stackMatL);
    this.stackR.position.x = PW / 2;
    this.stackL.position.x = -PW / 2;
    for (const m of [this.stackR, this.stackL]) {
      m.castShadow = true;
      m.receiveShadow = true;
      this.inner.add(m);
    }

    // 더미 맨 위/아래 페이지
    this.topR = this.makePagePlane(false, THREE.FrontSide);
    this.topL = this.makePagePlane(false, THREE.FrontSide);
    this.botR = this.makePagePlane(true, THREE.BackSide);
    this.botL = this.makePagePlane(true, THREE.BackSide);
    this.topR.position.x = PW / 2;
    this.botR.position.x = PW / 2;
    this.topL.position.x = -PW / 2;
    this.botL.position.x = -PW / 2;
    for (const m of [this.topR, this.topL]) m.receiveShadow = true;
    this.inner.add(this.topR, this.topL, this.botR, this.botL);

    // 넘어가는 낱장
    const vCount = (SEG_X + 1) * (SEG_Y + 1);
    this.sheetPos = new Float32Array(vCount * 3);
    const uvF = new Float32Array(vCount * 2);
    const uvB = new Float32Array(vCount * 2);
    const idx: number[] = [];
    for (let i = 0; i <= SEG_X; i++) {
      for (let j = 0; j <= SEG_Y; j++) {
        const k = i * (SEG_Y + 1) + j;
        uvF[k * 2] = i / SEG_X;
        uvF[k * 2 + 1] = j / SEG_Y;
        uvB[k * 2] = 1 - i / SEG_X;
        uvB[k * 2 + 1] = j / SEG_Y;
      }
    }
    for (let i = 0; i < SEG_X; i++) {
      for (let j = 0; j < SEG_Y; j++) {
        const a = i * (SEG_Y + 1) + j;
        const b = (i + 1) * (SEG_Y + 1) + j;
        const c = b + 1;
        const d = a + 1;
        idx.push(a, b, c, a, c, d);
      }
    }
    const posAttr = new THREE.BufferAttribute(this.sheetPos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    this.sheetGeoF = new THREE.BufferGeometry();
    this.sheetGeoF.setAttribute("position", posAttr);
    this.sheetGeoF.setAttribute("uv", new THREE.BufferAttribute(uvF, 2));
    this.sheetGeoF.setIndex(idx);
    this.sheetGeoB = new THREE.BufferGeometry();
    this.sheetGeoB.setAttribute("position", posAttr);
    this.sheetGeoB.setAttribute("uv", new THREE.BufferAttribute(uvB, 2));
    this.sheetGeoB.setIndex(idx);
    this.sheetFront = new THREE.Mesh(this.sheetGeoF, this.makePaper(THREE.FrontSide));
    this.sheetBack = new THREE.Mesh(this.sheetGeoB, this.makePaper(THREE.BackSide));
    this.sheetFront.castShadow = true;
    this.sheetBack.castShadow = true;
    this.sheetFront.frustumCulled = false;
    this.sheetBack.frustumCulled = false;
    this.inner.add(this.sheetFront, this.sheetBack);

    // 가까운 쪽부터 불러온다
    [1, 2, 3, o.pageCount, 4, 5].forEach((p) => this.loadTexture(p));

    this.layout();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  /* ---------- 재질 ---------- */

  private makePaper(side: THREE.Side) {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.93,
      metalness: 0,
      side,
    });
  }

  private makePagePlane(mirror: boolean, side: THREE.Side) {
    const geo = new THREE.PlaneGeometry(PW, this.PH);
    if (mirror) {
      const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      uv.needsUpdate = true;
    }
    const mat = this.makePaper(side);
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = -1;
    mat.polygonOffsetUnits = -1;
    return new THREE.Mesh(geo, mat);
  }

  /* 종이 더미 옆면: 낱장 경계마다 옅은 줄이 생기도록 셰이더에 한 줄 추가 */
  private makeEdgeMaterial(count: { value: number }) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf1f1ef,
      roughness: 1,
      metalness: 0,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uCount = count;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vEdgeZ;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvEdgeZ = position.z + 0.5;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vEdgeZ;\nuniform float uCount;",
        )
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\nfloat st = fract(vEdgeZ * uCount);\ndiffuseColor.rgb *= mix(0.8, 1.0, smoothstep(0.0, 0.45, st) * smoothstep(1.0, 0.55, st));",
        );
    };
    return mat;
  }

  /* ---------- 텍스처 ---------- */

  private loadTexture(page: number) {
    if (page < 1 || page > this.o.pageCount) return;
    if (this.textures.has(page) || this.loading.has(page)) return;
    this.loading.add(page);
    this.loader.load(
      this.o.pageSrc(page),
      (tex) => {
        if (this.disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        this.textures.set(page, tex);
        this.loading.delete(page);
        this.wanted.forEach((p, mat) => {
          if (p === page) this.applyMap(mat, tex);
        });
        if (!this.onReady && this.textures.has(1)) {
          this.onReady = true;
          this.emit();
        }
        this.dirty = true;
        this.preloadRest();
      },
      undefined,
      () => {
        this.loading.delete(page);
      },
    );
  }

  /* 화면에 필요한 쪽을 다 받은 뒤 나머지를 하나씩 순서대로 받는다 */
  private preloadRest() {
    if (this.loading.size > 1) return;
    const center = this.flipped * 2;
    for (let d = 0; d < this.o.pageCount; d++) {
      for (const p of [center + d, center - d]) {
        if (p >= 1 && p <= this.o.pageCount && !this.textures.has(p) && !this.loading.has(p)) {
          this.loadTexture(p);
          return;
        }
      }
    }
  }

  private applyMap(mat: THREE.MeshStandardMaterial, tex: THREE.Texture | null) {
    if (mat.map !== tex) {
      mat.map = tex;
      mat.needsUpdate = true;
    }
  }

  private setPage(mesh: THREE.Mesh, page: number | null) {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (page === null) {
      mesh.visible = false;
      this.wanted.delete(mat);
      return;
    }
    mesh.visible = true;
    this.wanted.set(mat, page);
    const tex = this.textures.get(page);
    if (tex) this.applyMap(mat, tex);
    else {
      this.applyMap(mat, null);
      this.loadTexture(page);
    }
  }

  /* ---------- 상태 → 장면 ---------- */

  private offsetFor(f: number) {
    if (f <= 0) return -PW / 2;
    if (f >= this.sheets) return PW / 2;
    return 0;
  }

  private build() {
    const turn = this.turn;
    const s = turn ? turn.s : this.flipped;
    const t = turn ? turn.t : 0;
    const S = this.sheets;
    const P = this.o.pageCount;

    const rightCount = turn ? S - s - 1 : S - s;
    const leftCount = s;
    const hR = rightCount * SHEET;
    const hL = leftCount * SHEET;

    this.inner.position.x =
      this.offsetFor(s) + (this.offsetFor(s + 1) - this.offsetFor(s)) * (turn ? t : 0);

    // 더미
    this.stackR.visible = rightCount > 0;
    this.stackL.visible = leftCount > 0;
    this.stackR.scale.z = Math.max(hR, 1e-4);
    this.stackL.scale.z = Math.max(hL, 1e-4);
    this.stackR.position.z = hR / 2;
    this.stackL.position.z = hL / 2;
    this.stackUniR.value = Math.max(rightCount, 1);
    this.stackUniL.value = Math.max(leftCount, 1);

    const topRightSheet = turn ? s + 1 : s;
    this.setPage(this.topR, rightCount > 0 && topRightSheet < S ? 2 * topRightSheet + 1 : null);
    this.setPage(this.topL, leftCount > 0 ? 2 * s : null);
    this.setPage(this.botR, rightCount > 0 ? Math.min(P, 2 * S) : null);
    this.setPage(this.botL, leftCount > 0 ? 1 : null);
    this.topR.position.z = hR + 0.0003;
    this.topL.position.z = hL + 0.0003;
    this.botR.position.z = -0.0003;
    this.botL.position.z = -0.0003;

    // 넘어가는 낱장
    if (turn) {
      this.sheetFront.visible = true;
      this.sheetBack.visible = true;
      this.setPage(this.sheetFront, 2 * s + 1);
      this.setPage(this.sheetBack, 2 * s + 2 <= P ? 2 * s + 2 : null);
      this.sheetBack.visible = true;
      const zBase = THREE.MathUtils.lerp(hR, hL, t) + SHEET * 0.6;
      this.bendSheet(turn, zBase);
    } else {
      this.sheetFront.visible = false;
      this.sheetBack.visible = false;
      this.wanted.delete(this.sheetFront.material as THREE.MeshStandardMaterial);
      this.wanted.delete(this.sheetBack.material as THREE.MeshStandardMaterial);
    }
  }

  private bendSheet(turn: Turn, zBase: number) {
    const theta = Math.PI * turn.t;
    const lift = Math.sin(Math.PI * turn.t);
    const sign = turn.dir === 1 ? -1 : 1; // 끝자락이 뒤따라오는 방향
    const ds = PW / SEG_X;
    const pos = this.sheetPos;
    for (let j = 0; j <= SEG_Y; j++) {
      const v = j / SEG_Y; // 0 = 아래, 1 = 위
      const y = (v - 0.5) * this.PH;
      // 아래 모서리를 먼저 집어 올리는 손 모양: 아래쪽 줄이 더 많이 휜다
      const rowCurl = turn.curl * lift * (1 + turn.diag * (0.5 - v) * 1.1);
      const rowLead = turn.diag * (0.5 - v) * 0.35 * lift * -sign;
      let x = 0;
      let z = 0;
      let k = j;
      pos[k * 3] = 0;
      pos[k * 3 + 1] = y;
      pos[k * 3 + 2] = zBase;
      for (let i = 1; i <= SEG_X; i++) {
        const u = (i - 0.5) / SEG_X;
        let phi = theta + sign * rowCurl * Math.pow(u, 1.6) + rowLead * u;
        phi = clamp(phi, 0, Math.PI);
        x += Math.cos(phi) * ds;
        z += Math.sin(phi) * ds;
        k = i * (SEG_Y + 1) + j;
        pos[k * 3] = x;
        pos[k * 3 + 1] = y;
        pos[k * 3 + 2] = zBase + z;
      }
    }
    const attr = this.sheetGeoF.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
    this.sheetGeoF.computeVertexNormals();
    this.sheetGeoB.setAttribute("normal", this.sheetGeoF.getAttribute("normal"));
  }

  /* ---------- 카메라·자세 ---------- */

  layout() {
    const c = this.o.canvas;
    const w = Math.max(1, c.clientWidth);
    const h = Math.max(1, c.clientHeight);
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const single = w / h < 0.95;
    if (single !== this.single) {
      this.single = single;
      this.fixFocus();
      this.emit();
    }
    this.dirty = true;
  }

  private fitDistance(w: number, h: number) {
    const v = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    return Math.max(h / 2 / v, w / 2 / (v * this.camera.aspect));
  }

  private poseQuat(b: number) {
    const sway = this.o.reducedMotion ? 0 : Math.sin(this.time * 0.45) * 0.16;
    const intro = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-0.5 + this.userPitch, 0.55 + sway + this.userYaw, 0.14, "XYZ"),
    );
    const reading = new THREE.Quaternion().setFromEuler(new THREE.Euler(READING_TILT, 0, 0));
    return intro.slerp(reading, b);
  }

  private updateCamera(dt: number, snap: boolean) {
    const b = easeInOut(this.pose);
    this.pivot.quaternion.copy(this.poseQuat(b));
    this.pivot.updateMatrixWorld(true);
    // 소개 화면에서는 책이 기울어 있으니 그림자 받는 면을 뒤로 물린다
    this.floor.position.z = THREE.MathUtils.lerp(-0.9, -0.09, b);

    const introDist = this.fitDistance(PW * 1.3, this.PH * 1.72);
    let readTarget = new THREE.Vector3(0, 0, 0);
    let readDist: number;
    if (this.single) {
      let lx = this.focus === "right" ? PW / 2 : -PW / 2;
      // 넘기는 동안에는 넘어가는 종이를 따라 카메라가 옆 쪽으로 옮겨 간다
      if (this.turn) lx = PW / 2 - PW * easeInOut(this.turn.t);
      readTarget = this.inner.localToWorld(new THREE.Vector3(lx, 0, 0));
      readDist = this.fitDistance(PW * 1.06, this.PH * 1.04);
    } else {
      readDist = this.fitDistance(PW * 2 * 1.04, this.PH * 1.06);
    }
    const target = new THREE.Vector3(0, 0, 0).lerp(readTarget, b);
    const dist = THREE.MathUtils.lerp(introDist, readDist, b);
    // 소개 화면에서는 아래 안내 문구 자리를 비우려고 책을 조금 위로 올려 보인다
    target.y -= (1 - b) * this.PH * 0.22;
    const goal = new THREE.Vector3(target.x, target.y, target.z + dist);

    if (snap || !this.camInit) {
      this.camPos.copy(goal);
      this.camTarget.copy(target);
      this.camInit = true;
    } else {
      const k = 9;
      this.camPos.set(
        damp(this.camPos.x, goal.x, k, dt),
        damp(this.camPos.y, goal.y, k, dt),
        damp(this.camPos.z, goal.z, k, dt),
      );
      this.camTarget.set(
        damp(this.camTarget.x, target.x, k, dt),
        damp(this.camTarget.y, target.y, k, dt),
        damp(this.camTarget.z, target.z, k, dt),
      );
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);
    return goal.distanceTo(this.camPos) > 1e-4 || target.distanceTo(this.camTarget) > 1e-4;
  }

  /* ---------- 루프 ---------- */

  private tick = (now: number) => {
    if (this.disposed) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;

    let active = false;

    // 자세 전환
    if (this.pose !== this.poseTo) {
      const k = clamp((now - this.poseStart) / this.poseDuration, 0, 1);
      this.pose = this.o.reducedMotion ? this.poseTo : THREE.MathUtils.lerp(this.poseFrom, this.poseTo, k);
      if (k >= 1) this.pose = this.poseTo;
      active = true;
    }
    if (this.phase === "intro" || this.pose < 1) active = true;

    // 소개 화면 관성 회전
    if (Math.abs(this.userYawVel) > 0.0001 && !this.ptr) {
      this.userYaw += this.userYawVel;
      this.userYawVel *= 0.92;
      active = true;
    }
    if (this.phase === "reading" && this.pose >= 1 && (this.userYaw !== 0 || this.userPitch !== 0)) {
      this.userYaw = 0;
      this.userPitch = 0;
    }

    // 넘김 트윈
    if (this.turnTween && this.turn) {
      const tw = this.turnTween;
      const k = clamp((now - tw.start) / tw.duration, 0, 1);
      this.turn.t = THREE.MathUtils.lerp(tw.from, tw.to, easeInOut(k));
      this.dirty = true;
      if (k >= 1) {
        this.turnTween = null;
        tw.done();
      }
    }

    if (this.dirty || active) {
      this.build();
    }
    const moving = this.updateCamera(dt, false);
    if (this.dirty || active || moving) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private emit() {
    this.o.onState({
      phase: this.phase,
      flipped: this.flipped,
      focus: this.focus,
      single: this.single,
      ready: this.onReady,
    });
  }

  /* ---------- 넘김 ---------- */

  private busy() {
    return !!this.turn;
  }

  private runTurn(dir: 1 | -1, duration: number, done?: () => void) {
    const S = this.sheets;
    if (dir === 1 && this.flipped >= S) return false;
    if (dir === -1 && this.flipped <= 0) return false;
    const s = dir === 1 ? this.flipped : this.flipped - 1;
    if (dir === -1) this.flipped = s;
    this.turn = { s, t: dir === 1 ? 0 : 1, dir, curl: 0.95, diag: 0.55 };
    const ms = this.o.reducedMotion ? 1 : duration;
    this.turnTween = {
      from: this.turn.t,
      to: dir === 1 ? 1 : 0,
      start: performance.now(),
      duration: ms,
      done: () => {
        this.turn = null;
        this.flipped = dir === 1 ? s + 1 : s;
        this.dirty = true;
        done?.();
        this.emit();
        this.preloadRest();
        const nextJob = this.queue.shift();
        if (nextJob) nextJob();
      },
    };
    this.dirty = true;
    return true;
  }

  private fixFocus() {
    if (this.flipped <= 0) this.focus = "right";
    else if (this.flipped >= this.sheets) this.focus = "left";
  }

  next() {
    if (this.phase === "intro") {
      this.open();
      return;
    }
    if (this.busy()) {
      if (this.queue.length < 3) this.queue.push(() => this.next());
      return;
    }
    if (this.single) {
      if (this.focus === "left" && this.flipped < this.sheets) {
        this.focus = "right";
        this.emit();
        this.dirty = true;
        return;
      }
      if (this.flipped >= this.sheets) return;
      this.focus = "left";
    }
    const quick = this.queue.length > 0;
    this.runTurn(1, quick ? 620 : 980);
    this.emit();
  }

  prev() {
    if (this.phase === "intro") return;
    if (this.busy()) {
      if (this.queue.length < 3) this.queue.push(() => this.prev());
      return;
    }
    if (this.single) {
      if (this.focus === "right" && this.flipped > 0) {
        this.focus = "left";
        this.emit();
        this.dirty = true;
        return;
      }
      if (this.flipped <= 0) return;
      this.focus = "right";
    }
    const quick = this.queue.length > 0;
    this.runTurn(-1, quick ? 620 : 980);
    this.emit();
  }

  goToPage(page: number) {
    const P = this.o.pageCount;
    const p = clamp(Math.round(page), 1, P);
    const f = Math.floor(p / 2);
    const focus: ViewerFocus = p % 2 === 1 && p < P ? "right" : "left";
    if (this.phase === "intro") this.setPose(1);
    this.queue = [];
    if (this.busy()) {
      // 진행 중인 넘김을 끝낸 뒤 이동
      this.queue.push(() => this.goToPage(p));
      return;
    }
    if (f === this.flipped) {
      this.focus = focus;
    } else if (Math.abs(f - this.flipped) === 1) {
      const dir: 1 | -1 = f > this.flipped ? 1 : -1;
      this.focus = focus;
      this.runTurn(dir, 980);
    } else {
      this.flipped = f;
      this.focus = focus;
    }
    this.fixFocus();
    this.dirty = true;
    this.emit();
    this.preloadRest();
  }

  /* ---------- 소개 ↔ 읽기 ---------- */

  private setPose(to: number) {
    this.poseFrom = this.pose;
    this.poseTo = to;
    this.poseStart = performance.now();
    this.phase = to >= 1 ? "reading" : "intro";
    this.emit();
  }

  open() {
    if (this.phase === "reading") return;
    this.setPose(1);
    if (this.flipped === 0) {
      const delay = this.o.reducedMotion ? 0 : this.poseDuration * 0.62;
      window.setTimeout(() => {
        if (this.disposed || this.phase !== "reading" || this.flipped !== 0 || this.busy()) return;
        if (this.single) this.focus = "left";
        this.runTurn(1, 1150);
        this.emit();
      }, delay);
    }
  }

  showObject() {
    if (this.phase === "intro") return;
    this.queue = [];
    this.userYaw = 0;
    this.userPitch = 0;
    this.setPose(0);
  }

  /* ---------- 포인터 ---------- */

  private localPoint(clientX: number, clientY: number) {
    const rect = this.o.canvas.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(this.pivot.quaternion);
    const p0 = this.inner.localToWorld(new THREE.Vector3(0, 0, 0));
    this.plane.setFromNormalAndCoplanarPoint(n, p0);
    const hit = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(this.plane, hit)) return null;
    return this.inner.worldToLocal(hit);
  }

  pointerDown(e: PointerEvent) {
    if (e.button > 0) return;
    const lp = this.localPoint(e.clientX, e.clientY);
    const lx = lp ? lp.x : 0;
    const ly = lp ? lp.y : 0;
    let mode: "none" | "orbit" | "turn" | "swipe" = "none";
    let dir: 1 | -1 = lx >= 0 ? 1 : -1;
    if (this.phase === "intro" || this.pose < 1) mode = "orbit";
    else if (this.single) {
      mode = "swipe";
      const rect = this.o.canvas.getBoundingClientRect();
      dir = e.clientX - rect.left >= rect.width / 2 ? 1 : -1;
    } else if (!this.busy()) {
      if ((dir === 1 && this.flipped < this.sheets) || (dir === -1 && this.flipped > 0)) mode = "turn";
    }
    this.ptr = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      lx0: lx,
      ly0: ly,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      mode,
      dir,
      moved: false,
    };
  }

  pointerMove(e: PointerEvent) {
    const p = this.ptr;
    if (!p || p.id !== e.pointerId) return;
    const now = performance.now();
    const dxScreen = e.clientX - p.x0;
    const dyScreen = e.clientY - p.y0;
    p.vx = (e.clientX - p.lastX) / Math.max(1, now - p.lastT);
    const stepX = e.clientX - p.lastX;
    p.lastX = e.clientX;
    p.lastT = now;
    if (!p.moved && Math.hypot(dxScreen, dyScreen) < 6) return;
    const firstMove = !p.moved;
    p.moved = true;

    if (p.mode === "orbit") {
      this.userYaw = clamp(this.userYaw + stepX * 0.006, -1.6, 1.6);
      this.userPitch = clamp(this.userPitch + (e.movementY || 0) * 0.004, -0.5, 0.5);
      this.userYawVel = stepX * 0.006;
      this.dirty = true;
      return;
    }
    if (p.mode !== "turn") return;
    const lp = this.localPoint(e.clientX, e.clientY);
    if (!lp) return;
    if (firstMove) {
      const s = p.dir === 1 ? this.flipped : this.flipped - 1;
      if (p.dir === -1) this.flipped = s;
      const grabV = clamp(p.ly0 / (this.PH / 2), -1, 1); // -1 아래, 1 위
      this.turn = { s, t: p.dir === 1 ? 0 : 1, dir: p.dir, curl: 1.2, diag: -grabV * 0.9 };
    }
    if (!this.turn) return;
    const rel = clamp((p.dir === 1 ? 1 : -1) + (lp.x - p.lx0) / PW, -1, 1);
    this.turn.t = Math.acos(rel) / Math.PI;
    this.dirty = true;
  }

  pointerUp(e: PointerEvent) {
    const p = this.ptr;
    if (!p || p.id !== e.pointerId) return;
    this.ptr = null;
    const cancelled = e.type === "pointercancel";

    if (!p.moved) {
      if (cancelled) return;
      if (this.phase === "intro") {
        this.open();
        return;
      }
      if (p.mode === "turn" || p.mode === "swipe" || p.mode === "none") {
        if (p.dir === 1) this.next();
        else this.prev();
      }
      return;
    }
    if (p.mode === "swipe") {
      const dx = e.clientX - p.x0;
      if (Math.abs(dx) > 30) {
        if (dx < 0) this.next();
        else this.prev();
      }
      return;
    }
    if (p.mode === "turn" && this.turn) {
      const turn = this.turn;
      const forward = p.dir === 1 ? turn.t > 0.33 || p.vx < -0.5 : turn.t > 0.67 && p.vx < 0.5;
      // forward: 왼쪽에 눕힘(t→1), 아니면 오른쪽(t→0)
      const to = forward ? 1 : 0;
      const ms = Math.max(180, 820 * Math.abs(to - turn.t));
      const s = turn.s;
      this.turnTween = {
        from: turn.t,
        to,
        start: performance.now(),
        duration: this.o.reducedMotion ? 1 : ms,
        done: () => {
          this.turn = null;
          this.flipped = to === 1 ? s + 1 : s;
          this.fixFocus();
          this.dirty = true;
          this.emit();
          this.preloadRest();
        },
      };
    }
  }

  hoverSide(clientX: number, clientY: number): "next" | "prev" | null {
    if (this.phase !== "reading" || this.single) return null;
    const lp = this.localPoint(clientX, clientY);
    if (!lp || Math.abs(lp.y) > this.PH / 2) return null;
    if (lp.x >= 0 && lp.x <= PW && this.flipped < this.sheets) return "next";
    if (lp.x < 0 && lp.x >= -PW && this.flipped > 0) return "prev";
    return null;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.textures.forEach((t) => t.dispose());
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const m = mesh.material;
        (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
      }
    });
    this.renderer.dispose();
  }
}
