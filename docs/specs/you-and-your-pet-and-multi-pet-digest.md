# Peternity: You & Your Pet + Multi-Pet, full spec digest

Sources:
- `~/Downloads/Peternity_You_and_Your_Pet_Developer_Handoff.pdf` (YYP, 7 pages, text only).
- `~/Downloads/Peternity_Multi_Pet_Portrait_Developer_Handoff_FINAL.pdf` (MP, 14 pages). Mockups: p1/p4 Step 1, p6 Step 2, p8 Step 3, p10 cart.

PDF glyph note: "■" in the PDF text is **₹** (also the checklist boxes; MP's "Make it gift-ready ■" is 🎁).

---

## 0. Ground rules (both products)

- **Written requirements beat generated mockups** (MP p2, p14). YYP p1: "Generated screen concepts are not authoritative for exact UI geometry, approved prices, or final production artwork."
- **Never hardcode illustrative values**: prices, discount %, delivery promises, upload limits (YYP p5; MP p3, p12).
- **The backend is the source of truth** for prices, discounts, eligibility and totals. Client totals are previews only; validate server-side and never trust client prices (YYP p5–6; MP p3, p12).
- **Keep unconfirmed items configurable and unpublished until Peternity approves**: any price, surcharge, service promise or production capability (MP p14). In this codebase that means admin-editable gates, per our "dynamic = admin-editable" rule.
- **Everyday Pet Portrait is the master.** Reuse its price/discount header, three-step tracker, back + product-name row, heading scale, card borders, selected state (brown border + check), Preview buttons, inputs, reassurance strip and cart. Don't redesign; no new checkout path.
- **Tokens:**
  - primary `#A97659` (CTA, selected borders, progress fill)
  - light beige `#F1E7DC` (warm panels)
  - page background `#FAF7F2`
  - main text `#2D202D`
  - secondary text `#6B5E53`
  - borders `#E8D6C8`
- **Layout:**
  - 390px reference width; QA at 360/375/390/430; no horizontal scroll.
  - 16px side gutters.
  - CTA: full width, 52px tall (MP adds 10px radius, 16px semibold white on brown).
  - Progress bar 6px (MP: rounded ends).
  - YYP: tap targets ≥ 44×44; content constrained to ~560px on wide screens.
  - MP: section spacing ~24px; related controls 12–16px.
- **Three steps, 33% / 66% / 100%.** The cart is **not** a fourth step (MP p2).
- **No product-summary panel at the top and no price/selection summary panel at the bottom of Step 2 or Step 3.** The top price header is enough (YYP p3–4; MP p2, p6, p8).

---

## 1. You & Your Pet Portrait (YYP)

### 1.1 Product (p2)
One category, two compositions; both include **1 person + 1 pet** in the starting price.

| Composition | What the customer gets | Price treatment |
|---|---|---|
| Me & My Pet | One person + one pet. | Included in starting price. |
| My Family & Our Pet | A family portrait with **their** pet. The supported family/group size must be defined by production. | + ₹500 over the starting price, as specified by the business owner. |

- Family is a **flat-price upgrade**, not a per-person/per-pet calculator.
- **MUST NOT** show "Add People"/"Add Pets" counters or charge per person/per pet. The customer makes one simple choice.
- Three configurator steps, then the existing cart. **MUST NOT** create a new checkout journey.
- Journey (p7): composition → portrait style and size → personalization → photo upload and details → existing cart.

### 1.2 Step 1: Choose Your Portrait (p2–3)
- **Heading:** "Together Is Our Favourite Place"
- **Copy:** "Turn a special moment with your loved ones and your pet into a beautiful, hand-drawn portrait."
- **Required order of sections:**
  1. Composition cards.
  2. Style cards "Framed Portrait" / "Canvas Portrait", each with a clear product image (Everyday card treatment).
  3. **Size cards, not a dropdown** (approved matrix for this product; don't take sizes/prices from mockups).
  4. "CONTINUE →".
  5. The same reassurance strip as Everyday.

| Card | Description | Price label |
|---|---|---|
| Me & My Pet | One person + one pet. | Included in starting price |
| My Family & Our Pet | A family portrait with **your** pet. | + ₹500 |

**Interaction rules:**
- Exactly one composition can be selected. The default **may** be Me & My Pet.
- Family adds ₹500; Me & My Pet removes it.
- No people/pet quantity counters.
- The framed image must visibly show **a frame and frame edges**; the canvas image must show **stretched canvas depth / wrapped edges**.
- Changing style updates the available sizes and the price (approved product/size matrix).
- The top price updates whenever composition, style or size changes.

### 1.3 Step 2: Personalize Your Portrait (p3)
- **Heading:** "Personalize Your Portrait"
- **Copy:** "Choose a background and add optional details to make it uniquely yours."
- **Backgrounds:** six standard ones: Pearl, Almond, Serenity, Celadon, Tea Rose, Black.
  - Use actual artwork previews.
  - Keep the same selected composition/subject arrangement across every preview.
- **Limited Edition:** a separate labelled group. [GATED: designs and surcharge approved]. Don't hardcode the concept surcharge.
- **Frame colour:** only when Framed is selected. Proposed: Black Frame / White Frame [CONFIRM].
- **Add Names:** toggle [DEFAULT: OFF]. Name field(s) appropriate to the selected composition [CONFIRM naming rules].
- **Add a Subtitle:** toggle [DEFAULT: OFF]. Max **30** characters; example "Best Friends Forever".
- **Priority Preview:** toggle [DEFAULT: OFF]. [GATED: service, surcharge and turnaround approved]. Never promise an unconfirmed SLA.
- **MUST NOT:** a special tribute/halo option (not in the initial release).
- **MUST NOT:** a top product-summary panel or a bottom price-summary panel.
- *The section order on this step is listed, not mandated (MP mandates frame colour first; see §4).*

### 1.4 Step 3: Upload Your Photos & Details (p3–4)
- **Heading:** "Upload Your Photos & Details"
- **Copy:** "Share your photos and a few details so our artists can create your perfect portrait."

| Method | Description | Implementation |
|---|---|---|
| One Complete Photo | A single photo with everyone together. | One required group photo upload. |
| Separate Photos | Individual photos of each person and pet. | Required upload slots based on the selected composition; label each slot clearly. |
| Mixed Photos | One group photo plus additional reference photos. | Required group photo plus optional reference uploads. |

- **Only expose methods production can reliably support**; hide the rest.
- **Photo Guide** link opens a modal/drawer with clear examples and photo tips.
- **Uploads:**
  - After a successful upload, show the thumbnail/filename and **Remove**.
  - Show upload progress and clear success/error states.
  - Requirements adapt to composition + method.
  - Reference photos are optional and **never change the composition or price**.
- **Artist Instructions:** optional textarea, **max 150** characters.
- **Full Name:** required.
- **Mobile:** required; **+91 preselected**. Country-code selection is allowed only **if the existing checkout supports it**.
- **Email:** optional.
- **Reassurance:** "You'll receive a preview before printing, with unlimited revisions to get your portrait just right." Use only if it matches current policy.
- **CTA:** "ADD TO CART" (printed **without** an arrow in YYP), plus the Everyday reassurance strip.
- **MUST NOT:** a bottom "Your Selections / Total Price" panel.

### 1.5 Cart (p4–5): reuse the existing cart exactly
The generated alternative cart concept is **not** the reference. Structure, in order:
1. Terracotta "YOUR SELECTION" header with close control.
2. White "Your Cart" panel.
3. Main line: thumbnail, product name, composition, framed/canvas, frame colour when applicable, size, background, names/subtitle when selected, photo/upload summary.
4. The existing quantity selector and Remove.
5. Terracotta "ADDITIONAL PRODUCTS": Custom Pet Mug, Custom Pet Fridge Magnet, Digital Download, Desk Portrait. **All OFF.**
6. A separate Gift Wrapping section. **OFF**; approved price; existing copy; **no personalized note** unless fulfilment approves one.
7. Coupon field + Apply.
8. Subtotal, discount, shipping/tax if applicable, total.
9. The existing "PROCEED TO CHECKOUT →".

Pricing and preservation rules:
- The **+₹500 sits inside the main product line price**. It is **never a separate add-on**.
- Add-ons and gift wrap add/remove their own lines and recalculate totals.
- Preserve checkout, payment, analytics, Meta Pixel events and cart behaviour.

### 1.6 Pricing and business rules (p5)

| Item | Rule / status |
|---|---|
| Starting product price | Approved YYP base price. **Not specified.** |
| Me & My Pet | Included in starting price. |
| My Family & Our Pet | +₹500 upgrade over the starting price. |
| Frame / Canvas | Approved price matrix; may vary by size and style. |
| Size options | Final list and prices to be supplied by Peternity. |
| Limited Edition background | Only if approved; surcharge not confirmed. |
| Priority Preview | Only if approved; fee and turnaround not confirmed. |
| Add-ons + gift wrap | Existing approved catalogue and prices. |

### 1.7 Data model / cart payload (p5–6)

| Field | Value |
|---|---|
| `product_type` | `you_and_your_pet` |
| `composition` | `me_and_my_pet` \| `family_and_our_pet` |
| `composition_upgrade` | 0 or 500 INR; backend-calculated |
| `portrait_style` | `framed` \| `canvas` |
| `frame_colour` | `black` \| `white`; null for canvas or unsupported |
| `size` | Approved SKU |
| `background` | Approved id |
| `limited_edition_background` | Optional id + backend surcharge |
| `names_enabled` / `names` | Boolean + value(s) |
| `subtitle_enabled` / `subtitle` | Boolean + text, ≤30 |
| `priority_preview` | Boolean; only if on sale |
| `photo_method` | `complete_photo` \| `separate_photos` \| `mixed_photos` |
| `photo_assets` | Asset refs with role/subject labels |
| `artist_instructions` | ≤150 |
| `customer_name` / `mobile` / `email` | Name + mobile required; email optional |

### 1.8 Acceptance checklist (p6, 16 lines)
1. Step 1 has only the two composition choices: no people/pet counters, no per-subject pricing.
2. Family adds **exactly** ₹500.
3. Frame and Canvas are visually distinct and use the Everyday card treatment.
4. Sizes and price update correctly for the selected style and size.
5. Step 2 has the six standard backgrounds plus optional names/subtitle.
6. Frame colour appears only for framed portraits.
7. Tribute/halo is **not** included.
8. Priority Preview and Limited Edition stay hidden until price/terms are approved.
9. Step 3 photo methods and upload requirements adapt to composition and method.
10. Name and Mobile are required; Email is optional; Artist Instructions ≤150.
11. Photo Guide, upload progress, success/error states, thumbnails and Remove all work.
12. The cart reuses the exact existing layout and checkout.
13. The four add-ons and gift wrap are OFF by default and recalculate totals.
14. The family upgrade is inside the main price, not an add-on.
15. Mobile QA passes at 360/375/390/430 with no horizontal scroll.
16. Analytics and Meta Pixel keep working.

### 1.9 Peternity must confirm before development (p6, 10 items)
1. Starting price and discount strategy.
2. Maximum family composition (people + pets) covered by the +₹500.
3. Frame/canvas size matrix and prices.
4. Whether both Black and White frames are available.
5. Whether Limited Edition backgrounds are offered, and the surcharge.
6. Whether Priority Preview is offered, its fee and its real turnaround.
7. Which of the three photo methods the artists can fulfil.
8. Upload file types, max size and count limits.
9. Unlimited-revision and preview-before-printing wording.
10. Add-on and gift-wrap prices.

---

## 2. Multi-Pet Portrait (MP)

### 2.1 Product and journey (p3)
- **One cohesive group portrait of 2+ pets, not a collage.** Everyday remains the one-pet product.
- **The base price includes 2 pets**; the surcharge starts at **pet 3** (flat or tiered [CONFIRM]).
- A pet who has passed away may be included. The halo is customer-selected and does **not** turn the order into a Memorial Portrait.
- Pet count drives the number of name inputs and, for Individual Pet Photos, the number of required upload slots. **Reference photos never count as pets.**
- Only show pet counts, sizes, photo methods and options production can fulfil.
- **Journey:** Step 1 Choose Your Portrait → Step 2 Personalize Your Portrait → Step 3 Upload Your Pets' Photos → existing Your Selection cart → existing checkout.
- **Price header** updates on format, pet count, size and paid options. Limited Edition and Priority Preview surcharges apply only if approved.
- **Navigation:**
  - Back preserves format, pet count, size, backgrounds, toggles, text, customer details and uploads.
  - Lowering the pet count keeps the remaining pets' data and safely removes (or asks to confirm removing) data for removed pets.
  - **Don't mark uploads or steps complete until the server confirms success.**

### 2.2 Step 1 (p4–5)
- **Heading:** "Bring Your Pets Together"
- **Copy:** "Celebrate all your furry family members in one beautiful portrait."
- **Top block:** reuse Everyday's price + original price + discount badge with the **calculated** price (not ₹1,999 / ₹2,499 / 20%).
- **Progress:** Step 1 of 3 — Choose Your Portrait, 33%.
- **Header row:** Back on the left, "Multi-Pet Portrait" on the right.
- **1. Select Portrait Style:**
  - Framed + Canvas side by side, using Everyday card dimensions and images.
  - **Preview buttons** open a modal/lightbox.
  - Selected card: brown border + checkmark.
- **2. How Many Pets?:**
  - Compact selectable cards; default **2 Pets** labelled "Included".
  - The approved surcharge shows on 3 Pets, 4 Pets, etc.
  - No options beyond the production maximum.
- **3. Choose Your Size:**
  - Everyday size cards (no dropdown) with dimensions and current price.
  - Only sizes valid for the **format AND pet count**.
- **CTA:** "CONTINUE →".
- **Strip:** Hand-drawn with love · Free shipping across India · Preview before printing.
- **Dynamic rules:**
  - Changing format updates eligible sizes and price.
  - Changing pet count updates the surcharge and eligible sizes immediately.
  - Never allow a size that can't produce a balanced, legible composition for that pet count.
  - Store the pet count and pass it forward.
- **Acceptance checks:**
  - 2 pets are preselected on load (unless product rules say otherwise).
  - Price updates with pet count, format and size.
  - Only valid combinations can proceed.
  - Preview opens and closes correctly on mobile.

### 2.3 Step 2 (p6–7)
- **Heading:** "Personalize Your Portrait"
- **Copy:** "Choose a background and add optional details to make it uniquely yours."
- **Approved layout rule:**
  - No product summary at the top and no price summary at the bottom.
  - After the heading and copy, **start directly with "1. Choose Frame Colour"** for Framed.
  - **For Canvas, hide that section and start with Background.**

**Sections, in order:**
1. **Choose Frame Colour:** Black Frame / White Frame, only for Framed and only if available.
2. **Choose a Background:**
   - Options: Pearl, Almond, Serenity, Celadon, Tea Rose, Black, plus approved Limited Edition options in the same section pattern.
   - **Actual group-portrait previews, not swatches.** Same pets, arrangement, scale and crop in every preview.
   - Everyday 3-column grid with the brown border + check selected state.
3. **Add Your Pets' Names (Optional):**
   - OFF by default.
   - When ON, one input per pet ("Pet 1 Name", "Pet 2 Name", …), **exactly** matching the pet count.
4. **Add a Subtitle (Optional):**
   - Independent toggle, OFF by default.
   - One input, **30 max, live character counter**; example "Our Little Family".
5. **A Special Tribute (Optional):**
   - OFF by default. Copy: "Would you like to add a subtle halo above one of your pets?"
   - When ON, a selector of the selected pets; the customer picks **exactly one**.
   - **Never infer bereavement from a photo. No wings or clouds. No Memorial conversion. No surcharge unless approved.**
6. **Priority Preview:** the compact Everyday card near the bottom; OFF by default. [GATED: price + service promise approved]. No unverified turnaround.

Then "CONTINUE →".

**Dynamic rules:**
- Name fields always match the pet count.
- When a pet is removed, update the halo selector and clear an invalid halo target.
- Selecting Canvas removes frame-colour state from the order configuration.
- Optional controls stay OFF unless the customer turns them on.

### 2.4 Step 3 (p8–9)
- **Heading:** "Upload Your Pets' Photos"
- **Copy:** "Share clear photos of all your pets. We'll turn them into a beautiful, hand-drawn portrait you'll love."
- Keep the price header and progress bar; no bottom panel; keep the strip and Add to Cart.

**Sections, in order:**
1. **Photo upload method:** three compact cards. **Show only the selected method's upload fields.**
   - **One Group Photo:** one required photo containing all pets; the customer can **confirm all pets are visible and identifiable**.
   - **Individual Pet Photos:** one required slot per pet ("Pet 1", "Pet 2", …); slot count equals pet count.
   - **Mixed Photos:** a required group photo plus optional per-pet references, each **associated with its pet**. **MUST NOT be enabled until production confirms the workflow.**
2. **Photo Guide:** reuse the Everyday card. The mobile modal covers:
   - clear, well-lit photos
   - faces visible
   - avoid blur and heavy filters
   - each pet identifiable
   - the group photo shows all pets
3. **Required upload area:** depends on the method; file types and size limit come from the backend.
4. **Reference photos:** optional; never increase the pet count; associate with a pet where relevant.
5. **Artist instructions:** optional, **150 max**. Placeholder "e.g., Keep them close together, place one pet in the centre...". The final composition stays subject to artistic feasibility.
6. **Your Details:**
   - Full Name (required).
   - Mobile (required, **+91 default, numeric keypad, Indian mobile validation**).
   - Email (optional unless the backend requires it).
7. **Reassurance:** "You'll receive a preview before printing, with unlimited revisions to get your portrait just right."
8. **CTA:** "ADD TO CART →".
9. **Strip:** Preview before printing · Free shipping across India · Hand-drawn with love.

**Upload states:**
- Per-file progress %.
- After **server-confirmed** success: thumbnail, success indicator, filename, **Replace** and **Remove**.
- Never claim an image passed a quality review.
- **Add to Cart stays disabled** until every required upload is complete and the details are valid.
- Preserve uploads and form data when going back.

### 2.5 Cart (p10–11): the existing Your Selection panel
- **Main line:** "Multi-Pet Portrait" with thumbnail, format, pet count, size and line price.
- **Details:** background; frame colour (if applicable); pet names (if supplied); subtitle (if supplied); halo status + selected pet (if enabled); Priority Preview (if enabled); photo method; upload/reference summary.
- **Hide empty or unselected fields.** Text must stay readable on mobile.
- Existing quantity selector + Remove.
- **Additional Products:** Custom Pet Mug, Custom Pet Fridge Magnet, Digital Download, Desk Portrait (compact portrait with stand).
  - Everyday row design; real price; original price **only for a genuine discount**.
  - Each OFF by default; selecting one adds a distinct line.
- **Gift Wrapping:** a separate section **after Additional Products and before Coupon Code**. OFF by default.
  - Copy: "Make it gift-ready 🎁" / "We'll beautifully wrap your portrait, ready to gift to someone special."
  - Approved price only. A gift message field only if fulfilment supports it.
- **Coupon Code** + Apply, with clear success/invalid feedback.
- **Totals:** Subtotal, Discount, Shipping (if applicable), Tax (if applicable), Total. **Don't promise free shipping** unless policy matches.
- **CTA:** "PROCEED TO CHECKOUT →". Cart and checkout totals must match.
- **Order handoff:**
  - Persist all config + file refs.
  - The production view must make pet count, pet-to-photo mapping, group image, references, halo target and artist instructions unambiguous.
  - **A reference photo is never an extra pet.**

### 2.6 Backend contract (p12)

| Group | Fields |
|---|---|
| Product | `product_type=multi_pet_portrait`; `format`; `size`; `quantity` |
| Pets | `pet_count`; per-pet id/order; optional `pet_name` per pet |
| Personalization | `background_id`; `frame_colour` if framed; `subtitle`; `halo_enabled`; `halo_pet_id`; `priority_preview_enabled` |
| Photos | `upload_method`; `group_photo_file_id`; `individual_photo_file_ids` → `pet_id`; `additional_reference_file_ids` → `pet_id` where applicable |
| Artist notes | `artist_instructions` (≤150) |
| Customer | `full_name`; `mobile_number`; `email` if provided |
| Cart | `add_on_skus`; `gift_wrap`; `coupon_code`; `discount`; `shipping`; `tax`; validated totals |

- **Never hardcode** ₹1,999 / ₹2,499 / +₹499 / +₹999 / +₹199 or add-on prices.
- Show the strikethrough and badge only when a genuine discount is active.

### 2.7 Business confirmations (p13, 12 rows)
1. Max pet count.
2. Extra-pet pricing (flat or tiered).
3. Size matrix by format × pet count.
4. Supported photo workflows.
5. Mixed-photo rules.
6. Standard + Limited Edition artwork and surcharges.
7. Halo (feasibility, look, free/paid, target rules).
8. Priority Preview (price, promise, hours, timezone, SLA trigger, out-of-hours handling).
9. Upload policy (types, max size, number of references, storage).
10. Desk Portrait (dimensions, material, stand, price, fulfilment).
11. Add-ons / gift wrap (assets, prices, stock, gift message).
12. Shipping / tax rules.

### 2.8 Acceptance checklist and analytics (p14)
**Checklist:**
- All four screens use the Everyday design system.
- Step 1 selections drive price and eligible sizes.
- Step 2:
  - frame colour only for Framed
  - consistent group previews
  - names match the pet count
  - halo target selection works
  - optional toggles start OFF
  - no top or bottom summary panels
- Step 3:
  - only the chosen method's fields show
  - Individual slots match the pet count
  - Mixed follows the approved production rules
  - Photo Guide opens
  - uploads show progress and server-confirmed success
  - Replace and Remove work
  - customer details validate
  - no bottom panel
- Cart:
  - shows all configuration data
  - add-ons and gift wrap add/remove lines and recalculate totals
  - coupon feedback works
  - cart and checkout totals match
- Back navigation preserves everything.
- 360/375/390/430 with no horizontal scroll or clipping.
- **No duplicate add-to-cart or purchase events.**

**Analytics:**
- Preserve the existing Pixel.
- Track the existing funnel events where available: step views, format, pet count, size, background, optional toggles, upload method, upload completion, add-to-cart, add-on selection, coupon, checkout initiation.
- Don't duplicate any event.

### 2.9 Mockup-only content (illustrative; written text wins)
- **Step 1 (p1 and p4 are the same render):**
  - Price block "Rs. 1,999.00", "Rs. 2,499.00", "20% OFF"; progress "STEP 1 OF 3 - CHOOSE YOUR PORTRAIT", "33% COMPLETE".
  - Framed selected. Card copy: "A ready-to-hang framed portrait for your home." / "A premium canvas print with a modern look."
  - Pet section helper: "Choose the number of pets to include in your portrait."
  - Pet cards: 2 Pets "Included" (green chip), 3 Pets "+₹499", 4 Pets "+₹999".
  - Size section helper: "Select the size that best fits your space." Sizes: 8 × 10 ₹1,999 / 12 × 16 ₹2,499 / 16 × 20 ₹3,499.
- **Step 2 (p6). Conflicts with the written text:**
  - The mockup shows **Background as "1." and "2. Frame Colour"**; the written rule puts frame colour first.
  - **"Sage"** appears instead of **Serenity**.
  - "Premium + ₹199"; Limited Edition "Misty Blue / Forest / Wildflower" at "+ ₹199".
  - Names helper "Show your pets' names on the portrait."; subtitle helper "(e.g. Our Furry Family)".
  - Tribute helper "Add a halo above a pet to honour their memory."
  - Priority "+ ₹199 … Get your preview within 1 working day (instead of 2–3 days)". **This is an unverified SLA: don't ship it.**
- **Step 3 (p8):**
  - Progress label "STEP 3 OF 3 - UPLOAD YOUR PHOTOS"; question "How would you like to upload your photos?".
  - Method helpers: "Upload one photo with all your pets together." / "Upload a separate photo for each pet." / "Upload a group photo plus additional reference photos."
  - "Upload Group Photo" with a "Required" chip; upload hint "JPG, PNG or HEIC (Max 10MB)" (illustrative).
  - "Add Additional Reference Photos (Optional) — Share more photos if you'd like (e.g., clearer face, different angle)."
  - "Anything you'd like our artist to know? (Optional)" with "0 / 150".
- **Cart (p10):**
  - "Framed Portrait · 2 Pets · 8 × 10".
  - A **"Halo (Tribute) Not added"** row. **This contradicts "hide empty fields": don't show it.**
  - Add-ons ₹1,499→₹599 / ₹499→₹199 / ₹499→₹299 / ₹999→₹499; gift ₹199.
  - Plural copy: "your pets' image", "of your pets."

---

## 3. Where the two PDFs differ

| Aspect | You & Your Pet | Multi-Pet |
|---|---|---|
| Step 1 selector | Composition: Me & My Pet / My Family & Our Pet (flat +₹500) | How Many Pets? (2 included; surcharge from pet 3) |
| Step 1 Preview buttons | Not mentioned | Required (modal/lightbox) |
| Step 2 order | Background → Limited Edition → Frame colour → Names → Subtitle → Priority (listed) | **Frame colour first** (Framed) → Background → Names → Subtitle → Tribute → Priority |
| Halo | **Excluded** | Included (exactly one pet, free unless approved) |
| Subtitle example | "Best Friends Forever" | "Our Little Family" |
| Step 3 heading | "Upload Your Photos & Details" | "Upload Your Pets' Photos" |
| Photo methods | One Complete Photo / Separate Photos / Mixed Photos | One Group Photo / Individual Pet Photos / Mixed Photos (Mixed gated) |
| After upload | Thumbnail/filename + Remove | + success indicator + **Replace** + Remove |
| Mobile | +91; country selector **if checkout supports it** | +91, numeric keypad, **Indian** validation |
| Step 3 CTA | "ADD TO CART" (no arrow) | "ADD TO CART →" |
| Field names | `portrait_style`, `photo_method`, `background`, `priority_preview`, `customer_name`/`mobile`/`email`, `names_enabled`/`subtitle_enabled`, `composition_upgrade` | `format`, `upload_method`, `background_id`, `priority_preview_enabled`, `full_name`/`mobile_number`/`email`, `halo_enabled`/`halo_pet_id`, per-pet ids |
| Layout extras | 44×44 tap targets; ~560px max width | 10px CTA radius; 24px / 12–16px spacing |

---

## 4. Traps vs the current code (checked against the code)

**Already matches:**
- The CTA component `src/components/everyday/ui.tsx:99-101` is 52px tall, 10px radius, 16px semibold uppercase, with an arrow icon on every CTA. So YYP's arrow-less "ADD TO CART" will render with an arrow anyway, consistent with Everyday.
- The strip orders already match MP: `trustStep1` (Step 1) = Hand-drawn → Free shipping → Preview; `trust` (Step 3) = Preview → Free shipping → Hand-drawn (`src/lib/everyday-content.ts`).
- Reassurance copy, gift copy, add-on names, frames (Black Frame / White Frame) and the cart banner/title are identical to the PDFs.

**Conflicts to fix in the new products:**
1. **The discount is a fake strikethrough.** `src/components/ProductInfo.tsx:1287-1294` shows `compareAtPrice(total, header.discountPercent)`, with the default at **30%**. That is a display markup, not a genuine catalog discount, and violates MP p12. The new products need a real compare-at price or 0.
2. **Names and subtitle default to ON.** `step2.petNameDefaultOn: true` and `subtitleDefaultOn: true`; both PDFs require OFF.
3. **Priority Preview is live with an SLA claim.** `step2.showPriority: true` with "Get your preview within 1 working day (Instead of 2–3 days)." Both PDFs require it gated until approved, with no SLA claim.
4. **The cart shows "Not added" rows.** `src/components/everyday/EverydayCart.tsx:123` uses `notAddedLabel`; MP requires hiding empty or unselected fields.
5. **The halo is priced as its own line.** `catalog.halo` defaults to ₹200, and `src/lib/pricing.ts:491,508` adds a separate "Halo Effect" line. MP allows no halo surcharge unless approved; YYP has no halo at all.
6. **`catalog.pets.human = 500` is not the YYP family upgrade.** It is the old "Human + Pet" upcharge on top of the Everyday base (`src/lib/pricing.ts:236`). YYP needs its own base price plus a separate composition upgrade (₹500, admin-editable).
7. **Extra-pet pricing has the wrong base.** `pets.three = 600` and `four = 1500` (`src/lib/pricing.ts:234-235`) are upgrades over the Everyday base. MP needs a base that **includes 2 pets** plus a surcharge from pet 3.
8. **Sizes are global**, not per product or per pet count: framed 8"x10", 12"x16", 18"x24"; canvas 8"x12", 16"x20", 20"x30" (`src/lib/pricing.ts:190-191`).
9. **The background id is "Tea Rosé"** (`src/lib/backgrounds.ts`); the PDFs say "Tea Rose". Change the label via the configurator, but **never the id** (it is stored on orders).
10. **Background tile art is per background, not per product.** There is one media slot per background, `everyday-bg-<id>` (`backgroundTileSlot`). Both products need their own previews (person + pet; a group of pets) with an identical arrangement on every background.
11. **Limited Edition backgrounds** today are Aurora / Meadow / Dusk (bg7–9). Keep them gated off in the new products until approved.
12. **Step 3 handles one photo only:** no method choice, no Replace, no artist instructions, a fixed "+91" prefix (`inputMode="numeric"` at `EverydayUploadStep.tsx:218`). The upload limit `uploadMaxMb: 10` is admin-editable.
13. **Orders hold one photo and one name.** `src/lib/record-order.ts:62-100` writes a single `photo_url`, a single `pet_name`, `num_pets` as text and `memorial_text`, with no structured config. Both products need a structured payload (`photo_assets` with roles and pet mapping, `composition`/`pet_count`, photo method, `halo_pet_id`, artist instructions).
14. **Desk Portrait may not be recorded.** The `extras` join in `src/lib/record-order.ts` lists mug, magnet and digital only. Check how the desk add-on is stored.
15. **Analytics hooks:** `AddToCart` at `src/components/ProductInfo.tsx:717`, `InitiateCheckout` at `src/components/ProductInfo.tsx:1135`, plus `ViewContentPixel` on the product page. Reuse them; don't add duplicates.
16. **Routing:** `src/lib/portraits.ts` already has `multi-pet-portrait` ("two") and `you-and-your-pet` ("human", named "You & Your Pet" where the PDF says "You & Your Pet Portrait"). `src/app/portraits/[slug]/page.tsx` enables the Everyday flow only for `everyday-pet-portrait`.
17. **Policy conflict: revisions.** The Everyday accordion says "2 revision rounds included", but the reassurance line says "unlimited revisions". Both PDFs ask to confirm the policy wording.
18. **Policy conflict: shipping.** The strip says "Free shipping across India", but MP says not to promise free shipping unless policy matches. Confirm.

---

## 5. Open questions, with safe interim defaults

| Question | Interim default (doesn't break the PDFs) |
|---|---|
| YYP base price + discount strategy | Admin-set price; no badge unless there's a genuine compare-at |
| Family group size covered by +₹500 | Admin-editable max; until defined, offer only One Complete Photo for Family |
| YYP naming rules | Admin-configurable fields per composition (e.g. Me & My Pet: person + pet name; Family: one names field) |
| Size matrix (YYP: style; MP: style × pet count) | Admin matrix; hide combinations without a price |
| Black + White frame availability | Admin frame list (both exist today) |
| Limited Edition backgrounds + surcharge | Admin gate **OFF** |
| Priority Preview fee + turnaround | Admin gate **OFF**; no SLA copy |
| Supported photo methods | Per-method admin toggles; **MP Mixed OFF** |
| Upload types, size, counts | Backend config (`uploadMaxMb` exists) |
| Revision / preview policy wording | Confirm; "unlimited" vs "2 rounds" conflict today |
| MP max pets; flat vs tiered surcharge | Admin list of pet counts + per-count surcharge (covers both models) |
| Halo feasibility / price | Admin toggle; price 0 unless approved |
| Desk Portrait details; add-on / gift prices | Existing catalogue |
| Shipping / tax | Existing rules; confirm the free-shipping claim |
| Country selector (YYP) vs Indian-only (MP) | Keep fixed +91 + Indian validation (current checkout has no selector) |
| YYP Step 2 order | Use MP's approved order (frame colour first for Framed) for store consistency |

---

## 6. Implementation map (built 2026-11-15)

Both products now run on the Everyday three-step configurator (`flow` = `multi_pet` / `you_and_your_pet` in `src/components/ProductInfo.tsx`); `/portraits/everyday-pet-portrait` is unchanged.

| Area | Where | Admin control |
|---|---|---|
| Routing | `src/app/portraits/[slug]/page.tsx` → `configuratorForSlug()` | — |
| Copy, switches, gates (per product) | `src/lib/everyday-content.ts` (`DEFAULT_MULTI_PET_CONTENT`, `DEFAULT_YOU_PET_CONTENT`, `FlowContent`); stored in `site-media/content/multi-pet.json` and `site-media/content/you-and-your-pet.json` | Admin → Configurator (`/admin/configurator`), product tabs → "Product options", "Sizes per pet count" |
| Photos (style cards, background tiles, guide examples, composition cards) | `src/lib/site-media-catalog.ts`, prefixes `multi-pet-*` / `you-pet-*` (fall back to the Everyday photo) | Admin → Configurator → Photos |
| Prices | `src/lib/pricing.ts`: Multi-Pet = size + `pets[count]` (two included, surcharge = `pets[n] − pets.two`); You & Your Pet = size + `pets.human` + `familyUpgrade` (family, inside the main line); halo = `multiPetHalo` (₹0 default) | Admin → Pricing (Number of pets; You & Your Pet and Multi-Pet panel) |
| Max pet count | `catalog.options.pets` status (hidden / out of stock) | Admin → Pricing → Number of pets |
| Server rules | `src/lib/product-order.ts` `configuratorPricingProblem()` (called by `src/lib/quote-order.ts`) | follows the admin switches |
| Order record | `src/lib/product-order.ts` `buildOrderDetails()` → `orders.order_details` (jsonb) via `src/lib/record-order.ts` | run `supabase/configurator-orders.sql` once |
| Staff view | `src/components/OrderConfiguration.tsx` in Admin → Orders and the artist portal | — |

Launch switches that start OFF: Limited Edition backgrounds, Priority Preview, Mixed Photos (both products). A Special Tribute is ON for Multi-Pet with no surcharge; You & Your Pet has no tribute.

Review fixes (same day):
- **Cart:** a cart is shared by pages that can show it. The home page, Memorial and Everyday share one cart, as before; Multi-Pet and You & Your Pet each own theirs. The cart button opens another product's portrait on its own page. Multi-Pet and You & Your Pet keep unfinished work in `peternity_draft_<product>`. Replacing another page's portrait asks first (`cart.replaceConfirm`).
- **Prices:** the header discount on both new products starts at 0%. The handoff allows a strikethrough only for a genuine discount; set one in Admin → Configurator → Header when approved.
- **Add-ons:** `orders.addon` is built on the server from what was priced, never copied from the browser (the print vendor reads it).
- **Migration gate:** without `orders.order_details`, Multi-Pet / You & Your Pet orders are refused before payment, so production never gets one without its photo mapping. After payment they are still saved, and the details go to the timeline.
- **Halo:** when the halo pet has no name on the order, the customer describes it (`halo_pet_note`). Production can then find it in a group photo.
- **Sizes:** You & Your Pet has its own size rules per composition, next to Multi-Pet's per pet count.
- **Admin editors added:** Frames, Photo guide, Details below, both trust strips, page subtitle, max photo size and the default-on switches.
- **Order record:** `quantity` is now saved in `order_details`.
