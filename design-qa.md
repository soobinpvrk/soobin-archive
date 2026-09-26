# Design QA — Week 01 Interview Typography

- Source visual truth:
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_OV7fMh/스크린샷 2026-09-26 오후 2.47.05.png`
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_7BdhNC/스크린샷 2026-09-26 오후 2.47.41.png`
- Implementation screenshots:
  - `/private/tmp/soobin-archive-qa/implementation-desktop-1280x720.png`
  - `/private/tmp/soobin-archive-qa/implementation-mobile-390x844.png`
- Focused comparison: `/private/tmp/soobin-archive-qa/typography-comparison.png`
- Viewports: desktop `1280 × 720` CSS px; mobile `390 × 844` CSS px.
- Pixel dimensions and density: reference screenshots `3024 × 1964` px with browser chrome; implementation captures match their CSS viewport dimensions at density 1. The focused comparison normalizes both typography regions into equal `640 × 560` panels.
- State: `/introduction/1`, dark theme, top-of-page state. Mobile and desktop responsive states checked.

## Full-view comparison evidence

The implementation preserves the site's existing information architecture (week table of contents, article heading, home control) while adopting the reference's editorial hierarchy: small muted index, large heavy Korean display text, tighter tracking, a narrower reading measure, and generous vertical rhythm. No horizontal overflow was present at `390px`.

## Focused region comparison evidence

The combined typography comparison shows that the question weight, scale, compact tracking, and line breaks now closely match the visual density of the reference quote column. The answer remains deliberately smaller and muted so question and answer retain distinct semantic roles; its size, weight, and measure were increased enough to feel part of the same editorial system.

## Required fidelity surfaces

- Fonts and typography: existing Pretendard/Helvetica stack retained; questions use weight 800, responsive `2.1rem–2.7rem` sizing, `1.42` line height, and `-0.025em` tracking. Answers use responsive `1.12rem–1.3rem`, weight 450, and `1.85` line height.
- Spacing and layout rhythm: question blocks are right-aligned within a `740px` measure with responsive top and bottom spacing. Mobile spacing and type scale are reduced independently.
- Colors and visual tokens: black background, off-white display text, muted gray answer text, and existing border token remain consistent with both the reference mood and current product.
- Image quality and asset fidelity: typography-only change; existing randomized circular home image remains sharp and correctly masked.
- Copy and content: all interview questions and answers are unchanged.

## Findings

- No actionable P0, P1, or P2 differences remain.
- P3: the reference uses one uniformly bold quotation block, while the implementation uses a large question plus a smaller answer. This is intentional to preserve Q&A comprehension and scanning.

## Comparison history

1. Initial implementation comparison found a P2 hierarchy mismatch: the question matched the reference direction, but the answer retained the previous small, light density.
2. Fix applied: increased answer size and weight, narrowed its measure, and increased question scale slightly.
3. Post-fix evidence: `/private/tmp/soobin-archive-qa/typography-comparison.png`; desktop and mobile captures show the corrected hierarchy with no overflow or broken wrapping.

## Interaction and console checks

- The circular `안녕하세요?` control navigated successfully from `/introduction/1` to `/`.
- No runtime console errors were found. A development-only Fast Refresh full-reload warning occurred after CSS editing and is not present in the production build.

## Implementation checklist

- [x] Large editorial question typography
- [x] Readable, narrower answer measure
- [x] Responsive mobile scale
- [x] No horizontal overflow at 390px
- [x] Home navigation works
- [x] Production build passes

final result: passed
