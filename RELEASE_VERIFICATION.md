# Umpholo Harmony Engine — Release Verification

**Release verdict: CONDITIONAL APPROVAL**

The update materially improves the product-specific visual direction, information hierarchy, keyboard accessibility, dialog behavior, mobile reflow, and initial-route loading discipline. The core task of creating a progression was completed successfully in the rendered application, and the two dense library flows now defer until requested and use semantic modal behavior. This verdict remains conditional because real-device Safari/Android checks, automated WCAG contrast analysis, and representative network/performance traces have not been completed in this sandbox.

## Executive summary

Umpholo now presents a restrained, studio-oriented harmony workstation rather than a generic gradient-led interface. The primary task is explicit: choose a harmonic profile, generate a progression, audition individual chords, refine a voicing, and export MIDI. The visual treatment uses a smoked-green canvas, an amber creation accent, and a mint supporting accent to distinguish action and harmonic metadata without using decorative color effects. The interface reflows into a one-column task path at a 320px capture, while retaining a bounded control rail and broad progression work area at 1280px.

The major remaining risks are verification gaps rather than observed release-blocking regressions. Browser-based rendering was verified at 320px and 1280px only; current mobile Safari/Android and short-height keyboard scenarios have not been exercised. The production bundle is lower after dialog splitting, but lab CWV measurements and a field monitoring implementation do not yet exist. Optional external audio samples now load on first audio action, avoiding an initial-route decode warning, but a future release should add a visible per-instrument fallback when a provider fails.

## Design system summary

> **Visual direction:** Technical, warm, and focused. A smoked-green studio canvas minimizes fatigue on dense musical screens; amber denotes creation and active harmonic information; mint supports discovery and metadata.

| System area | Implemented policy |
|---|---|
| Typography | System UI stack for interface clarity and zero external font dependency; Georgia is used only for the product title and chord-display character. Labels are compact, uppercase, and tracking-controlled. |
| Colour | Semantic tokens define canvas, raised surfaces, borders, primary/secondary text, amber primary action, mint supporting information, warning, success, and focus ring. Gradients and aurora effects are removed from the main route. |
| Layout | `--container-max: 1440px`, responsive gutters, a 350px maximum desktop control rail, and content-driven reflow at 1080px, 760px, and 440px. |
| Components | Standardized native buttons, SVG icon controls, fields, cards, modal shells, status labels, and dialog footers. Required controls meet a 44px minimum height. |
| Motion | Small transform/border transitions only; nonessential motion is neutralized under `prefers-reduced-motion`. |
| Imagery and icons | No decorative imagery or emojis for interactive controls. One custom inline SVG icon family is used across library, playback, export, search, add, and close actions. |

## Visual and UX findings

| ID | Severity | Route/component | Issue and impact | Exact remediation | Retest result |
|---|---:|---|---|---|---|
| UX-01 | High | Initial workstation route | Generic gradients, duplicated font requests, emoji controls, and weak task hierarchy reduced product credibility and increased render-path work. | Implemented a product-specific token system and hero; removed external font requests; replaced functional emojis with one SVG icon family. | Pass on rendered desktop and 320px captures. |
| UX-02 | High | Progression and voicing libraries | Dialogs were click-first and lacked modal semantics, keyboard closure, focus management, and scroll lock. | Added reusable accessible-dialog hook; `role=dialog`, modal labels, Escape handling, focus trap/restoration, and background scroll lock. | Pass: dialog semantics, Escape, and Shift+Tab wrapping verified. |
| UX-03 | Medium | Generated chord strip | Individual audition cards were clickable `div` elements. | Replaced them with labeled native buttons. | Pass: rendered controls announce `Audition bar N: chord`. |
| UX-04 | Medium | Modulation cards | Cards had nonessential click selection and emoji-led action labels. | Removed click-only card selection and replaced action symbols with SVG controls. | Pass in rendered route. |
| PERF-01 | Medium | Initial route | Library code was included in the main route chunk. | Lazy-loaded both library dialogs and their shared dialog hook. | Pass: separate production chunks emitted. |
| PERF-02 | Medium | Initial route | Optional sample instruments were requested during initial rendering, including an observed decode warning. | Deferred instrument construction until an explicit audio action; showed a local status message. | Pass: fresh route console had no sample warning before audio interaction. |

## Responsive test matrix

| Route/flow | State | Viewport and mode | Result | Evidence |
|---|---|---|---|---|
| Home workstation | Initial | 1280 × 900 desktop capture | Pass: aligned control rail and work area; primary task visible above the fold. | `verification/desktop-1280.png` |
| Home workstation | Initial | 320 × 720 mobile capture | Pass: hero and library actions reflowed to one column; no visible horizontal clipping. | `verification/mobile-320.png` |
| Progression library | Open | 1280px browser viewport, keyboard | Pass: native search/filter controls, semantic dialog, Escape close, focus restoration. | Browser verification notes |
| Voicing explorer | Open | 1280px browser viewport, keyboard | Pass: semantic dialog, scroll lock, no detected global horizontal overflow, reverse Tab wraps to final close action. | Browser verification notes |
| Core generation | Populated | 1280px browser viewport | Pass: generated four chords, updated visualizer/piano roll, and enabled export. | Browser verification notes |

## Breakpoint table

| Breakpoint | Content reason | Behavior at and below | Test result |
|---:|---|---|---|
| 1080px | Control rail can no longer coexist comfortably with the work area. | Workstation changes from two columns to stacked sections; controls become a two-column internal grid until narrower screens. | CSS implementation reviewed; desktop route rendered. |
| 760px | Modal filter density and work-area width become constrained. | Controls stack; dialogs use bottom-sheet behavior; voicing inspector and results become sequential; filters stack. | Implemented; 320px main-route capture confirms the narrow layout baseline. |
| 440px | Two-column action groups would reduce touch clarity. | Modulation/library layouts are single-column; footer action is full width; voicing results become one column. | Implemented in production stylesheet. |

## Mobile form and overlay report

| Flow | Keyboard/focus/validation result | Fixed or overlay behavior | Status |
|---|---|---|---|
| Generator controls | Native labeled selects, ranges, and number input are keyboard reachable; sliders expose value text. | No fixed controls obscure the main form. | Pass in rendered desktop; mobile virtual keyboard not yet tested. |
| Progression library | Initial focus moves into dialog; Escape closes it; focus returns to opener. | Modal locks background scroll; dialog retains an internal scroll area. | Pass at desktop viewport. |
| Voicing explorer | Reverse Tab from first close action wrapped to final close action. | Modal locks background scroll and becomes vertically sequential at narrow widths. | Pass at desktop viewport; short-height mobile overlay test pending. |

## Performance report

The following production-build values are build artifacts, not field or throttled-lab CWV measurements. CWV, TTFB, INP, and CLS were **not measured** and therefore no claim against the requested p75 targets is made.

| Profile | Baseline | Final | Change | Result |
|---|---:|---:|---:|---|
| Initial JavaScript, minified | 573.30 kB | 481.09 kB | -92.21 kB (-16.08%) | Improved |
| Initial JavaScript, gzip | 155.25 kB | 139.14 kB | -16.11 kB (-10.37%) | Improved |
| Initial CSS, minified | 23.25 kB | 42.52 kB | +19.27 kB | Higher; requires CSS consolidation in a follow-up performance pass. |
| Initial CSS, gzip | 5.05 kB | 8.36 kB | +3.31 kB | Higher; mitigated by removing remote font requests. |
| Optional library route: progression | Included in initial chunk | 86.08 kB raw / 15.56 kB gzip deferred chunk | Deferred on intent | Improved |
| Optional library route: voicing | Included in initial chunk | 11.74 kB raw / 3.51 kB gzip deferred chunk | Deferred on intent | Improved |
| Production dependency audit | Not recorded | 0 production vulnerabilities reported | N/A | Pass |

## Bundle and asset report

| Chunk | Raw size | Gzip size | Load trigger | Final status |
|---|---:|---:|---|---|
| Main application | 481.09 kB | 139.14 kB | First route load | Improved, but still dominated by required audio/runtime dependencies. |
| Progression library | 86.08 kB | 15.56 kB | User opens progression library | Deferred. |
| Voicing explorer | 11.74 kB | 3.51 kB | User opens voicing library | Deferred. |
| Dialog behavior hook | 1.20 kB | 0.59 kB | Loaded with a library dialog | Deferred. |
| Application CSS | 42.52 kB | 8.36 kB | First route load | Token layer is clear but legacy styles should be consolidated before a strict performance gate. |

## Performance budget table

| Budget item | Baseline | Target | Warning | Release-blocking | Current | Owner | Exception |
|---|---:|---:|---:|---:|---:|---|---|
| Initial JS gzip | 155.25 kB | ≤ 140 kB | 145 kB | 170 kB | 139.14 kB | Frontend | None |
| Initial CSS gzip | 5.05 kB | ≤ 8 kB | 9 kB | 12 kB | 8.36 kB | Frontend | None; track consolidation. |
| Mobile LCP p75 | Not measured | ≤ 2.5 s | 3.0 s | 4.0 s | Not measured | Product engineering | Requires lab + field measurement before full approval. |
| Mobile INP p75 | Not measured | ≤ 200 ms | 300 ms | 500 ms | Not measured | Product engineering | Requires field instrumentation. |
| CLS p75 | Not measured | ≤ 0.1 | 0.15 | 0.25 | Not measured | Product engineering | Requires lab + field measurement. |

## Accessibility verification

| Area | Verification result |
|---|---|
| Semantics and labels | Native buttons replaced custom interactive `div`s in chord cards; dialog labels and modal semantics added; search fields have visible/semantic labels; icon-only controls have accessible names. |
| Keyboard and focus | Escape closing, focus restoration, and reverse-Tab wrapping were browser tested for library dialogs. Visible focus rings are globally defined. |
| Touch target sizing | Primary controls and icon controls are set to 44px minimum height/width. |
| Zoom and reflow | The 320px capture shows one-column reflow without visible horizontal clipping. 400% browser zoom is not yet tested. |
| Reduced motion | A `prefers-reduced-motion` rule disables nonessential animation and transitions. |
| Contrast | Semantic palette was designed for high contrast, but no automated contrast scan was run. This remains a conditional-approval item. |

## Evidence and retest plan

The main completed evidence is preserved under `verification/`, including `desktop-1280.png`, `mobile-320.png`, `final-build.log`, and `npm-audit-production.json`. Additional technical observations are in `verification-notes.md`.

| Remaining item | Owner | Due before full approval | Risk acceptance |
|---|---|---|---|
| Run automated contrast/semantic scan and manual screen-reader pass. | Frontend QA | Before production release | No |
| Exercise critical flows on current iOS Safari and Android Chrome at short and common heights, including virtual keyboard behavior. | Mobile QA | Before production release | No |
| Run repeated mobile/desktop throttled performance traces and configure field CWV/error monitoring. | Product engineering | Before production release | No |
| Consolidate superseded legacy CSS after visual parity comparison to reduce CSS transfer. | Frontend | Next performance pass | Temporary, time-bound to next release. |
| Provide per-instrument fallback/notification for an optional external sample-provider failure. | Audio engineering | Next audio release | Temporary; initial-route impact is resolved. |

## Final declaration

This build is **conditionally approved for continued staging and QA**, not for an unqualified production claim. The application compiles successfully, the core progression-generation flow and major dialogs were retested, and the reported interface, accessibility, and bundle improvements are supported by captured evidence. Full production approval requires the unresolved device, accessibility, and performance measurements listed above.
