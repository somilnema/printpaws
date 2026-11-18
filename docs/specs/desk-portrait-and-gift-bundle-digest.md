# Peternity: Desk Portrait + Signature Gift Bundle, spec digest

Sources (16 November 2026 handoffs):
- `~/Downloads/Peternity_Desk_Portrait_Developer_Handoff.pdf` (10 pages; mockups p3, p5, p7, cart p9).
- `~/Downloads/Peternity_Signature_Gift_Bundle_Developer_Handoff.pdf` (11 pages; mockups p3, p5, p7, cart p9).

The PDF glyph "■" is **₹**. The written requirements win over the generated mockups. Both handoffs make the Everyday page and cart the source of truth for shared UI.

---

## 0. Ground rules (both products)

- **Scope:** only the configurator below the price. The gallery, title, price and discount area stay exactly as on every product page.
- **Three steps, then the existing Everyday cart.** There is no new checkout.
- **Mobile QA:** 360 / 375 / 390 / 430 px, with no horizontal scroll and the CTA always reachable.
- **No hardcoded prices.** Mockup amounts are illustrative: Desk +₹149 / +₹249, greeting card +₹199. Every price is set in Admin → Pricing.
- **Everything customer-facing is admin-editable:** copy, lists, switches, photos.

## 1. Desk Portrait (slug `mini-desk-portrait`, configurator id `mini_desk`)

| Rule | Implementation |
|---|---|
| One fixed size, no size selector | No style or size step. `content.desk.productionSize` (internal) is written to `orders.size`. |
| Wooden stand always included | Shown on Step 1 ("Good to Know"), in the cart ("Wooden stand: Included") and on the order (`wooden_stand` token). It is never priced. |
| 1 pet vertical; 2–3 pets horizontal | `deskLayout()`, automatic, stored as `layout_orientation`. |
| Extra charge for 2 and 3 pets | Admin → Pricing → Desk Portrait: base, extra for 2 pets, extra for 3 pets (each is an extra over 1 pet). |
| Step 2: six colour swatches | `content.deskColours`: Cream, Beige, Light Pink, Sage Green, Light Blue, Lavender. They are editable (label, hex, show/hide, add custom). The ids are stored on orders and never change. |
| Pet name(s) required | One field; commas separate multiple names. Limit `desk.namesMax` (30). |
| Subtitle optional, OFF | Toggle with example chips (`desk.suggestions`). Limit `desk.subtitleMax` (30). |
| No portrait preview on Step 2 | None is rendered. |
| Step 3: N photos for N pets | Slots `pet-1..pet-N`, with progress, thumbnail, Replace and Remove. Lowering the pet count asks before removing extra photos. |
| Name + mobile (+91) required; email optional | Same validation as Everyday (Indian mobile). |
| Cart | Everyday cart with: pet count, layout, colour, names, subtitle, stand included, extra-pet charge, photos. Quantity, remove, coupon, totals and checkout are reused. Add-ons and gift wrap are **hidden by default**. Per the handoff ("no unnecessary add-ons"), each can be switched on in Admin → Configurator → Desk Portrait. |

## 2. Signature Gift Bundle (slug `signature-gift-bundle`, configurator id `gift_bundle`)

| Rule | Implementation |
|---|---|
| Tiers | **Essential:** portrait (framed or canvas) + custom mug + hi-res digital portrait + standard packaging. **Signature:** everything in Essential + fridge magnet + premium packaging. The contents are fixed in code (`bundleInclusions`), so nothing can be double-charged. The labels are editable. |
| Signature highlighted, not preselected | Badge "★ Best Value" (editable). `bundle.defaultTier` is `""` by default, so Continue waits for a choice. |
| Style + size | The Everyday style and size cards. Sizes come from the live catalogue; the admin can hide sizes per tier ("Sizes per tier"). |
| Price | Tier price (Admin → Pricing → Signature Gift Bundle) **plus** the existing style × size portrait price. The greeting card is added when selected. |
| Step 2 | Six Everyday backgrounds with portrait previews; pet name toggle OFF (20); subtitle toggle OFF (30); frame colour, Priority and Limited Edition hidden. |
| Greeting card | One optional paid add-on (no postcard or letter choice). When ON, a message is required (≤ `bundle.greetingMax`, 150). Admin switches control whether it is offered at all and per tier. |
| Step 3 | One photo (required). Optional pet type (Dog / Cat / Other), breed and age. The age ranges are an admin list. Name and mobile are required; email is optional. |
| Cart | The main line shows tier, style and size. An "Included in your bundle" list is priced ₹0. The greeting card is its own paid line with the message. Additional Products and Gift Wrapping are hidden (packaging is included; included items are never offered again). |
| Fulfilment | `orders.addon` carries `bundle_<tier>`, `bundle_mug`, `bundle_digital`, `bundle_magnet` (Signature), `packaging_<type>` and `greeting_card`. The staff view shows them as items to produce. |

## 3. Launch checklist (Peternity must confirm)

1. Desk base price and 2-pet / 3-pet charges (placeholders ₹999 / +₹149 / +₹249).
2. Desk production size and physical dimensions (`desk.productionSize`, internal only).
3. Final Desk colour palette that production can print.
4. Character limits: Desk names and subtitle (30 / 30); Bundle name, subtitle and card message (20 / 30 / 150).
5. Bundle tier prices (placeholders ₹999 / ₹1,499 on top of the portrait price) and the greeting card price (placeholder ₹199).
6. Bundle sizes per tier and framed / canvas variants.
7. Whether the greeting card is offered with both tiers.
8. Upload formats and maximum size (`step3.uploadMaxMb`); pet age ranges.
9. Upload the photos: Desk Step 1 examples (`mini-desk-pets-1..3`), Bundle tier photos (`gift-bundle-tier-essential|signature`), gallery and landing cards.
10. Both products are live by default. To hide one again, turn off **Launch** in Admin → Configurator → Desk Portrait options / Bundle options; its card then says "Coming soon" and its page returns 404.
