# Accessibility Checklist — MVP Sign-off

## Semantic HTML
- [x] Uses `<main>`, `<header>`, `<nav>`, `<section>` landmarks
- [x] Heading hierarchy: `<h1>` → `<h2>` → `<h3>` without skipping levels
- [x] `<nav>` has `aria-label="Primary"`
- [x] Decorative elements use `aria-hidden="true"`
- [x] `lang="en"` set on `<html>`

## Keyboard Navigation
- [x] Skip-to-content link present and functional
- [x] All interactive elements reachable via Tab
- [x] Focus styles visible on all focusable elements (`focus-visible` outline)
- [ ] Tab order follows visual reading order (verify manually)
- [ ] Escape key closes any open dialogs (N/A currently — no dialogs)

## Screen Reader Support
- [x] Status messages use `role="status"` and `aria-live="polite"`
- [x] Form inputs have associated labels or placeholder text
- [x] Buttons have descriptive text content
- [ ] Error messages programmatically associated with inputs (future: `aria-describedby`)

## Color and Contrast
- [x] Text meets WCAG AA contrast ratio (4.5:1 for body, 3:1 for large text)
- [x] Dark mode supported via `prefers-color-scheme`
- [x] Status badges use border + text color (not color alone)
- [ ] Run automated contrast check (axe or Lighthouse) before launch

## Forms
- [x] Required fields marked with `required` attribute
- [x] Submit buttons clearly labeled
- [x] Disabled state visually distinct (`opacity: 0.6`)
- [ ] Inline validation messages (future enhancement)

## Responsive / Mobile
- [x] Viewport meta tag set (`width=device-width, initial-scale=1.0`)
- [x] Layout adapts at 640px and 1024px breakpoints
- [x] Touch targets at least 44×44px equivalent (buttons have sufficient padding)
- [x] No horizontal scroll at 320px viewport width
- [ ] Test on real mobile devices before launch

## Images and Media
- [x] Decorative images use `aria-hidden="true"` (streetscape visual)
- [ ] If content images are added later, require `alt` text

## Automated Testing
- [ ] Run Lighthouse accessibility audit (target score ≥90)
- [ ] Run axe DevTools scan (target 0 critical/serious violations)
- [ ] Run WAVE extension check

## Manual Testing
- [ ] Navigate entire site using keyboard only
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Verify zoom to 200% without layout breakage
- [ ] Verify high-contrast mode renders correctly
