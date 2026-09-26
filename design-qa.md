# Design QA — Index Density, Cursor Timing, and Main List Layout

## Comparison target

- Source visual truth:
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_4QUEtv/스크린샷 2026-09-26 오후 5.25.38.png`
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_Ywi3M7/스크린샷 2026-09-26 오후 5.27.50.png`
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_TOzhpR/스크린샷 2026-09-26 오후 5.28.59.png`
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_IVl0qd/스크린샷 2026-09-26 오후 5.31.19.png`
- Implementation screenshots:
  - `/private/tmp/soobin-archive-qa-6/main-greeting-complete-1512x882.png`
  - `/private/tmp/soobin-archive-qa-6/main-index-1512x882.png`
  - `/private/tmp/soobin-archive-qa-6/detail-index-1512x882.png`
  - `/private/tmp/soobin-archive-qa-6/detail-mobile-390x844.png`
- Desktop source pixels: `3024 × 1964` at `2×`, including approximately `100 CSS px` of macOS and Chrome chrome.
- Desktop implementation pixels/CSS size: `1512 × 882` at density `1`, captured as page content only.
- Normalization: compared the source page region below the browser chrome against the implementation's `1512 × 882` content viewport.
- Mobile implementation pixels/CSS size: `390 × 844` at density `1`.
- States: completed main greeting; main index anchored at `#introduction`; `/introduction/1` top state; mobile `/introduction/1` top state.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The detail index now uses a lighter `550` base weight, `700` current weight, `1.34` line height, and a `0.12em` row gap. This matches the lighter, compact navigation rhythm in the first reference without changing the site's existing type family or color hierarchy.
- The main index adopts the left-label/right-content structure shown in the Phi reference. Category labels and their week lists sit on one shared ruled row on desktop, while mobile collapses them to a single column with no horizontal overflow.
- Main list rows are reduced to `0.68em` vertical padding and `1.35` line height; the measured desktop row height is `46.1px`, noticeably tighter than the previous layout.
- The continuation cursor stays at opacity `0` for both the empty and `저` states. It appears and starts the existing `1.5s` blink only after `저는` is complete.

## Required fidelity surfaces

- Fonts and typography: existing Pretendard and display font assignments are preserved. Only requested navigation/list weights and leading were reduced.
- Spacing and layout rhythm: desktop categories use a dedicated left track and lists use the right track; mobile shares one left edge. Section rules align across both tracks.
- Colors and visual tokens: black background, white active text, dim upcoming text, and border tokens are unchanged.
- Image quality: no raster assets were modified. The existing random portrait home button remains sharp and circular.
- Copy and content: all category names, week numbers, constraints, greeting text, and interview content are unchanged.

## Full-view and focused evidence

The source and implementation were opened together for comparison. Full-view evidence confirms the main page's two-track structure and the detail page's lighter index hierarchy. Focused DOM measurements were used for the cursor visibility sequence and list density because those timing and line-height details are not reliably judged from a single static frame.

## Interaction and responsive checks

- Cursor sequence verified: `"" / opacity 0` → `저 / opacity 0` → `저는 / blink active`.
- Detail navigation verified by moving from `/introduction/1` to `/introduction/0` and back.
- Desktop checked at `1512 × 882`; mobile checked at `390 × 844` with `0px` horizontal overflow.
- Browser console checked with no warnings or errors.
- `npm run lint`, `npm run build`, and `git diff --check` passed.

## Comparison history

1. Initial implementation pass applied all requested changes.
2. Same-state comparison found no actionable P0/P1/P2 mismatch, so no additional visual-fix loop was required.

## Implementation checklist

- [x] Detail index one weight step lighter
- [x] Detail index vertical rhythm tightened
- [x] Cursor hidden until `저는` completes
- [x] Main list row spacing tightened
- [x] Main categories moved left and contents right on desktop
- [x] Responsive one-column fallback verified
- [x] Navigation and build verified

final result: passed
