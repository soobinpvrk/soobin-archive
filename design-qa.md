# Design QA — Interview Numbering, Quotes, and Layout Gap

- Source visual truth:
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_pwuU5O/스크린샷 2026-09-26 오후 2.55.48.png`
  - `/private/var/folders/f5/1g5v4tg55zz2lq_v48q99ngr0000gn/T/TemporaryItems/NSIRD_screencaptureui_pAuqz4/스크린샷 2026-09-26 오후 2.55.55.png`
- Implementation screenshots:
  - `/private/tmp/soobin-archive-qa-3/implementation-desktop-1280x720.png`
  - `/private/tmp/soobin-archive-qa-3/implementation-mobile-390x844.png`
- Focused comparison: `/private/tmp/soobin-archive-qa-2/typography-comparison.png`
- Viewports: desktop `1280 × 720` CSS px; mobile `390 × 844` CSS px.
- Pixel dimensions and density: implementation screenshots match their CSS viewport dimensions at density 1. The two source images are cropped typography references rather than full-page layouts, so the focused comparison normalizes them into separate reference panels alongside a cropped implementation panel.
- State: `/introduction/1`, dark theme, top-of-page state.

## Full-view comparison evidence

The desktop implementation now places `1.`, `2.`, and so on as small muted labels above each question, matching the original page structure while replacing the former zero-padded numbering. The article's visible content begins at `295.2px` while the table of contents ends at `218.4px`, leaving a `76.8px` focus gap. On mobile the additional article padding is removed, preserving the full `342px` reading width.

## Focused region comparison evidence

The reference comparison established the desired period-style numbering and paired quotation marks. The final implementation retains those details while moving the number back above the question and reducing the display scale for a calmer hierarchy. The answer remains intentionally smaller and gray to preserve question/answer scanning.

## Required fidelity surfaces

- Fonts and typography: the title is `32px`, the question is `23.2px`, and the number label is `15.2px` on the verified desktop viewport. At `390px`, the title is `29.6px` and the question is `22.4px`. Quotation marks inherit the answer type without introducing a competing size.
- Spacing and layout rhythm: desktop article content receives responsive `20–32px` left padding; mobile resets it to zero. Existing vertical rhythm and dividers are preserved.
- Colors and visual tokens: existing black, off-white, muted gray, and border tokens are unchanged.
- Image quality and asset fidelity: no image assets were introduced or modified; the existing home avatar remains a real circular image.
- Copy and content: question numbering changes from `01` to `1.` presentation only. Interview text is unchanged, with curly quotes added visually around non-empty answers.

## Findings

- No actionable P0, P1, or P2 differences remain.
- P3: the answer is lighter and smaller than the reference quote. This is intentional because it is subordinate answer copy, not the page's primary statement.

## Comparison history

1. Earlier implementation had a P2 hierarchy mismatch: small detached `01`, `02` labels did not match the reference's integrated numbered statement.
2. Earlier implementation had a P2 content-treatment mismatch: answers had no quotation marks and the article sat visually close to the table of contents.
3. First fix applied: integrated normalized numbers into question lines, added curly opening/closing quotes to answered paragraphs, and added responsive desktop-only article inset.
4. Final balance fix: moved normalized numbers back above the question, reduced question scale from `38.4px` to `23.2px`, and reduced the detail-page title to `32px`.
5. Post-fix evidence: the current desktop and mobile implementation captures listed above. No horizontal overflow or broken wrapping remains.

## Interaction and console checks

- The `안녕하세요?` home control navigated successfully from `/introduction/1` to `/` and browser back returned to the interview.
- No console errors were found.
- Mobile horizontal overflow check passed: `scrollWidth` and `clientWidth` were both `390px`.

## Implementation checklist

- [x] Separate `1.`–`5.` labels above questions
- [x] Paired curly quotes on non-empty answers
- [x] Increased desktop TOC-to-article focus gap
- [x] Preserved mobile reading width
- [x] Verified home navigation and console
- [x] Production build passes

final result: passed
