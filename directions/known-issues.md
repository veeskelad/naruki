# Lessons Learned

### Prototype calculations were presented as production logic
- **Error**: Existing salary and vacation pages imported simplified stubs.
- **Cause**: The visual prototype and production domain model were mixed.
- **Solution**: Keep verified constants and pure calculation engines separate
  from page components and cover threshold behavior with unit tests.

### Client-only routing weakens initial indexability
- **Error**: The original Vite SPA returned the same empty shell for all URLs.
- **Cause**: Route content was mounted only after JavaScript execution.
- **Solution**: Pre-render each public route with Vike and hydrate interactions.

### macOS sips cannot rasterize the social SVG files
- **Error**: `sips -s format png` returned error 13 for valid SVG artwork.
- **Cause**: The installed ImageIO SVG reader cannot extract these documents.
- **Solution**: Render the SVG with the installed Playwright Chromium and save
  the exact 1200 x 630 element screenshot as PNG.

### Radix state selector was applied to the wrong element
- **Error**: Every force-mounted FAQ answer was visible even though each
  accordion trigger had `aria-expanded="false"`.
- **Cause**: Radix placed `data-state="closed"` on the content container, while
  the Tailwind state selector was passed to its inner text wrapper.
- **Solution**: Expose a container class on the local accordion primitive and
  apply state-based visibility to the element that owns `data-state`.

### Force-mounted accordion content reopened after animation
- **Error**: Closed FAQ items looked expanded again after using the shadcn
  accordion animation preset.
- **Cause**: `forceMount` kept the content in the DOM, but the closed state no
  longer kept a persistent `height: 0` after the animation finished.
- **Solution**: Keep `data-[state=closed]:h-0` on the accordion content while
  using `animate-accordion-up/down` for the motion.

### Accordion keyframes felt abrupt on open with forceMounted content
- **Error**: Opening the FAQ looked almost instant while closing still animated.
- **Cause**: The height keyframe preset was not giving a symmetric perceived
  transition once the content stayed mounted for SEO.
- **Solution**: Prefer a grid-template-row transition with opacity for shared
  open/close motion when the content must remain in the DOM.

### Grid row transitions did not read as an obvious open motion
- **Error**: The FAQ still felt like it snapped open even though close
  animation was visible.
- **Cause**: Grid track interpolation was too subtle for the short FAQ content.
- **Solution**: Use `max-height` plus opacity for a more legible open/close
  motion on short accordion panels.

### Two-column FAQ layout caused left text to feel like it jumped
- **Error**: Expanding the accordion made the left column feel like it shifted
  with the right-hand content.
- **Cause**: The grid container was stretching items instead of anchoring them
  to the top.
- **Solution**: Use `items-start` and `self-start` on side-by-side sections
  where one column grows independently.

### Schedule preview needed explicit max-height clipping
- **Error**: The salary schedule preview looked open even when the toggle said
  it was collapsed.
- **Cause**: The table retained its intrinsic height inside a grid wrapper, so
  the collapse animation did not actually clip the content.
- **Solution**: Animate the wrapper with explicit `max-height` and `opacity`
  instead of relying on grid rows for table content.

### Vite preview kept stale asset names after rebuild
- **Error**: Local preview returned 404s for newly generated CSS/JS chunks after
  a fresh build.
- **Cause**: The preview server was started before the latest `dist/` files
  were regenerated, so it kept serving the old manifest references.
- **Solution**: Rebuild first, then restart preview on a fresh port or restart
  the running preview process before browser QA.
