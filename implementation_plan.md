# Implementation Plan - Sanique Cosmetics Luxury UI Upgrade

This plan details the upgrade of the Sanique Cosmetics frontend from a "clean/basic luxury" design to a premium, modern luxury beauty experience. We will use elegant luxury colors (blush pink, dusty rose, champagne gold, warm ivory, soft peach, deep black) and introduce smooth keyframe transitions, micro-interactions, scroll reveal animations, and decorative floating elements while preserving 100% of the backend logic, MongoDB schemas, and existing product features.

## User Review Required

> [!IMPORTANT]
> - **Existing Functionalities Preserved**: AI Skin Scanner, cart drawer, wishlist, login, checkout, tracking, and product detail integrations will remain fully functional. Only the CSS styles and minor presentation JS triggers are updated.
> - **Aesthetics**: The design will look high-end, premium, and sophisticated (similar to brands like Rhode or Dior Beauty) rather than childish or neon.

## Open Questions

> [!NOTE]
> There are no open questions. The requirements are fully detailed, and the colors/design elements are clearly specified.

## Proposed Changes

We will modify the core CSS stylesheets and small segments of Javascript files to implement the visual transitions.

---

### Component: Global Variables & Baseline
Update variables to incorporate the refined color tokens, premium shadows, and improved borders.

#### [MODIFY] [variables.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/variables.css)
- Update primary background (`--bg-primary`) to **Warm Ivory** (`#FAF7F5`).
- Add/update color tokens:
  - `--blush`: `#D98A9A`
  - `--rose-gold`: `#C96B82` (Dusty Rose)
  - `--soft-peach`: `#E7A06A`
  - `--gold`: `#D6B36A` (Champagne Gold)
  - `--charcoal`: `#171717` (Deep Black)
- Refine drop shadows to use subtle rose-gold/champagne-colored glows instead of plain grey.
- Ensure dark mode mappings preserve compatibility with the upgraded luxury palette.

---

### Component: Animations & Page Preloader
Introduce keyframe micro-animations, background floating blobs, page entrance preloader, and scan lasers.

#### [MODIFY] [animations.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/animations.css)
- Define the page loader layout `.page-preloader` with a fade-in logo and drawing gold/pink accent line.
- Add float keyframes for background blobs: `@keyframes floatBlob`.
- Optimize IntersectionObserver reveal styles (`.fade-up.reveal` to use `15-25px` translate with smooth cubic-bezier transitions).
- Style the glowing scanner border and pulsing ready text for the AI Skin Scanner.
- Respect motion accessibility using `@media (prefers-reduced-motion: reduce)` to disable decorative floating and animation loops.

#### [MODIFY] [animations.js](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/js/animations.js)
- Wire up the window load handler to dismiss the page preloader quickly.

---

### Component: Hero Section
Elevate the main homepage hero banner.

#### [MODIFY] [hero.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/hero.css)
- Implement subtle pink/peach radial gradient in `.hero-image-render` behind the cosmetic renders.
- Add an animated glow backdrop surrounding the floating products.
- Polish slide transition timing (cubic-bezier) and text slide-ups.
- Style the hero primary buttons with sweep/shine visual effects.

---

### Component: Navigation & Header
Polishing the global navigation bar.

#### [MODIFY] [navbar.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/navbar.css)
- Update the scrolled state (`header.scrolled`) to use a polished, semi-transparent frosted glass design with a subtle inner border highlight.
- Re-design the navigation link underlines (`.nav-item::after`) using a modern scaleX draw transition.
- Animate icon buttons on hover with smooth translate/scale micro-effects.
- Add the pulse keyframe selector `.cart-count.pulse` for the shopping cart badge.

#### [MODIFY] [main.js](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/js/main.js)
- Modify `updateCartBadge()` to temporarily add the `.pulse` class when the item quantity updates, triggering visual feedback.

---

### Component: Collection & Product Cards
Enhancing cards with luxury aesthetics and hover reveals.

#### [MODIFY] [cards.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/cards.css)
- Add border-radius of `24px` to `.category-card` and `.product-card`.
- Polish the dark/pink gradient overlay on collections.
- Slide text upward by `8px` and draw a gold accent line below titles on collection card hover.
- Zoom card images smoothly (scale ~`1.05`) without overflow.
- Hide product actions (`.product-actions`) by default and slide them up smoothly on hover.
- Apply subtle warm gradients to product image wrappers.
- Style discount badges with smooth gradients.

---

### Component: Button System
Unifying buttons to match the cosmetics luxury brand.

#### [MODIFY] [buttons.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/buttons.css)
- Refine `.btn-primary` and `.btn-luxury` to use the blush-to-peach/champagne gradient.
- Add scale active triggers for click feedback.
- Refine `.btn-outline` to use ivory/transparent backgrounds with thin dark borders and blush glows on hover.

---

### Component: Footer & Details Layouts
Adding finishing luxury accents.

#### [MODIFY] [footer.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/footer.css)
- Apply linear-gradient background to the footer.
- Style section headers with gold-to-pink gradient text.
- Elevate social links hover with lift and rotation.
- Make top border an elegant dual-color accent.

#### [MODIFY] [products.css](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/css/products.css)
- Check and polish product page layouts for visual consistency.

#### [MODIFY] [index.html](file:///c:/Users/Sanchita/OneDrive/Desktop/sanique-cosmetics/public/index.html)
- Insert the page loader element (`#page-preloader`) just inside the body.
- Insert the background floating elements container (`.luxury-bg-glows`).
- Clean up inline styles on the AI Skin Scanner preview widget so that the scanner-preview-card styles apply correctly.

---

## Verification Plan

### Automated Verification
Since this is a visual and presentation-oriented redesign:
1. Run `npm run dev` to start the Node server.
2. Verify all routes compile correctly and the database connects successfully.

### Manual Verification
1. **Preloader**: Verify the preloader displays the Sanique logo and fades out quickly upon page load.
2. **Hero Section**: Verify slide transitions, floating animations, background particles, and the gradient glow around product renders. Check CTA sweep animation on hover.
3. **Navbar**: Scroll the page and check the frosted glass transition, link underlines, and icon scaling. Add items to the cart and verify that the cart badge pulses.
4. **Cards**: Verify category card scaling, text lift, gold accent lines, product card quick-add button reveals, and wishlist heartbeat animations.
5. **AI Skin Scanner**: Section and modal camera scan button must launch correctly and complete the diagnostic.
6. **Footer**: Check the gradient border accent and social icon transitions.
7. **Responsiveness**: Verify desktop, tablet, and mobile layouts do not cause horizontal scrolling or broken elements.
