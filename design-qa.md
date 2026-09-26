# Design QA — Main Typing and Interview Labels

- Source visual truth: `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_JYfjCq/스크린샷 2026-09-26 오후 3.11.54.png`
- Implementation screenshots:
  - `/private/tmp/soobin-archive-qa-4/main-typed-complete-1280x720.png`
  - `/private/tmp/soobin-archive-qa-4/interview-labels-1280x720.png`
- Viewport: `1280 × 720` CSS px at density 1.
- States: main page after typing completion; `/introduction/1` top-of-page state.

## Full-view and focused evidence

The main-page composition, scale, alignment, and cursor thickness remain consistent with the supplied screenshot. The continuation no longer rises into place: it begins empty, types `저`, pauses, then types `는`. The cursor is hidden before typing, remains steady during the pause, and begins a slower `1.5s` blink only after the word is complete. The interview page keeps the previously approved type scale and spacing while replacing numeric markers with Korean sequence labels.

No additional focused crop was needed because the typed continuation and first two interview labels are clearly readable in the full-size captures.

## Required fidelity surfaces

- Fonts and typography: existing Pretendard weights and responsive sizes are unchanged. The continuation preserves the same font size and weight while changing only its reveal behavior.
- Spacing and layout rhythm: the continuation reserves a fixed `2.2em` typing line so the first character does not recenter or jump when the second appears.
- Colors and visual tokens: black background, white greeting, and cursor color are unchanged.
- Image quality and asset fidelity: no image assets were changed.
- Copy and content: interview markers now read `첫번째 질문`, `두번째 질문`, `세번째 질문`, `네번째 질문`, and `다섯번째 질문`.

## Findings

- No actionable P0, P1, or P2 differences remain.
- No P3 polish issues were found in the requested states.

## Comparison history

1. Initial CSS-only typing attempt had a P1 reliability issue: hidden-tab animation timing could leave both characters invisible while the cursor appeared.
2. Fix applied: replaced delayed width animation with explicit React state timers, added cleanup, and handled reduced-motion preferences.
3. Post-fix browser evidence confirmed the sequence `"" → "저" → "저는"` and a cursor animation duration of `1.5s` after completion.

## Interaction and console checks

- Main sequence verified at the empty, first-character, and completed states.
- All five interview labels were read from the rendered DOM in order.
- Fresh-server browser verification reported no console errors.
- `npm run lint` and `npm run build` passed.

## Implementation checklist

- [x] Character-by-character `저 → 는` typing
- [x] Deliberate pause between characters
- [x] Slower post-completion cursor blink
- [x] Reduced-motion fallback
- [x] Korean ordinal interview labels
- [x] Production build passes

final result: passed
