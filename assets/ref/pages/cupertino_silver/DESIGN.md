# Design System Strategy: The Elevated Native

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Atelier"**
This design system moves beyond the "standard minimalist" aesthetic to achieve a bespoke, editorial feel. The goal is to emulate the precision of a high-end physical object—think of the weight of premium paper or the machined edge of aluminum. We achieve this not through more decoration, but through extreme intentionality in white space, "breathable" layouts, and a rejection of the "boxed-in" web. We break the template look by using high-contrast typography scales and tonal layering that feels organic rather than mechanical.

---

## 2. Color & Surface Architecture
Our palette is rooted in a sophisticated monochromatic range, using `primary` (#005bc1) only as a functional beacon.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Use background shifts to define boundaries. A `surface-container-low` section sitting on a `surface` background provides all the separation the eye needs without the visual noise of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use a "Nested Depth" approach:
- **Base Layer:** `surface` (#f9f9fe)
- **Secondary Sectioning:** `surface-container-low` (#f2f3fa)
- **Interactive Cards:** `surface-container-lowest` (#ffffff) to create a subtle "pop" against the background.
- **Top-Level Overlays:** `surface-bright` for floating menus.

### The "Glass & Gradient" Rule
To elevate the "native app" feel, use **Glassmorphism** for navigation bars and floating action elements. Apply a 70% opacity to your surface color paired with a `backdrop-blur` of 20px. 
*Pro-Tip:* Use a subtle linear gradient on main CTAs (transitioning from `primary` to `primary_dim`) to give buttons a slight "convex" feel, mimicking a physical tactile surface.

---

## 3. Typography
We utilize **Inter** to mimic the high-density legibility of San Francisco. The hierarchy is designed to create an editorial rhythm.

| Level | Token | Size | Weight / Usage |
| :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | Semi-bold. Use for hero moments only. |
| **Headline** | `headline-sm` | 1.5rem | Medium. The standard "Page Title" size. |
| **Title** | `title-md` | 1.125rem | Medium. High-contrast against body text. |
| **Body** | `body-lg` | 1rem | Regular. Maximum readability. |
| **Label** | `label-md` | 0.75rem | All-caps or Bold. Used for utility metadata. |

**The Editorial Shift:** Increase the `letter-spacing` of `label-sm` by 0.05rem and reduce it for `display-lg` by -0.02rem. This creates a custom, "kerned" look that separates this system from generic frameworks.

---

## 4. Elevation & Depth
We eschew the "material" shadow in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** For floating modals, use a shadow with a blur of `40px` and an opacity of `6%`. The shadow color must be derived from `on_surface` (#2c333d) rather than pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.
*   **Roundedness:** All primary containers must use `lg` (1rem/16px) or `xl` (1.5rem/24px) corners to maintain the friendly, premium "handheld" feel.

---

## 5. Components

### Buttons
- **Primary:** Background `primary`, text `on_primary`. Use a 12px (`md`) corner radius.
- **Secondary:** Background `secondary_container`, text `on_secondary_container`. No border.
- **Tertiary:** Text `primary`, background transparent. Only use a background shift on hover.

### Input Fields
- **Default State:** Use `surface-container-high` as the background. No border.
- **Focus State:** Subtle `primary` ghost border (20% opacity) and a 1px inner glow.
- **Error State:** Background `error_container` with `on_error_container` text.

### Cards & Lists
- **The "No Divider" Mandate:** Forbid the use of line dividers. Separate list items using `spacing-3` (1rem) of vertical white space or by alternating background tones between `surface-container-low` and `surface`.
- **Interaction:** Cards should scale slightly (1.02x) on hover rather than changing shadow depth.

### Contextual Components
- **The "Glass Header":** A sticky top navigation using `surface` at 80% opacity with a `backdrop-blur`.
- **The "Activity Indicator":** Use a soft pulsing glow using the `surface_tint` color for loading states instead of a mechanical spinner.

---

## 6. Do’s and Don’ts

### Do
- **DO** use the `20` (7rem) spacing token for major vertical sections to create "white space as a feature."
- **DO** use `surface-container-highest` for small utility tags or chips to make them feel "recessed" into the UI.
- **DO** align all typography to a strict baseline grid to ensure the minimalist layout feels "locked in."

### Don’t
- **DON’T** use pure black (#000) for text. Always use `on_surface` (#2c333d) to maintain a premium, ink-on-paper look.
- **DON’T** use 1px dividers to separate content; use the spacing scale `1.5` to `3` to create "implied" sections.
- **DON’T** use standard system shadows. If an element needs to float, it needs a "wide and light" ambient shadow.