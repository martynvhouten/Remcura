### Dialogs QA checklist

- [ ] Header shows 24px icon, compact title and optional subtitle; consistent padding
- [ ] Body uses token padding and scrolls vertically when content is long
- [ ] Footer is sticky, buttons right-aligned on desktop and stacked on mobile
- [ ] Button heights are consistent (uses `--control-height-md`)
- [ ] ESC and overlay close the dialog when not `persistent`
- [ ] Focus is trapped and first focusable element is focused on open
- [ ] Mobile opens fullscreen by default; respects `preventMobileFullscreen`
- [ ] No inline min/max width on inventory dialogs; uses size props (`sm|md|lg|xl`)
- [ ] All icon-only buttons have `aria-label`
- [ ] Works in dark mode with sufficient contrast

Manual steps

1. Open `Dev → Dialogs Gallery` route and exercise all sizes and variants
2. Open inventory dialogs (Stock Transfer, Quick Adjustment, Counting Session)
3. Resize to mobile and verify fullscreen, footer stacking, and scroll behavior
4. Press ESC and click overlay to confirm close behavior; toggle `persistent`
5. Tab-cycle to confirm focus trap and initial focus on first input

 Accessibility & keyboard

- [ ] Error summary region announced (role="alert" aria-live="assertive")
- [ ] Enter triggers submit where applicable; double-submit prevented via loading
- [ ] Header announced with title and subtitle

 Modal stack policy

- [ ] Attempting to open a dialog while another is open is prevented or converted into an internal step

