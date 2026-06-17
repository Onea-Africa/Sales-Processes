# Onea Pricing Precision Directive

**Owner:** Neo Sikhitha, Onea Africa  
**Applies to:** Every public package, Solution Builder configurator, supplier product, Apple configuration, add-on and internal quotation tool  
**Launch principle:** People buy into prices, not the idea of prices.

## Non-Negotiable Standard

Onea must show a price only when that price can be calculated from a current, identifiable source.

Every customer choice must have a financial consequence that is immediate, accurate and visible. When a customer changes a product, specification, service tier, quantity, contract term, coverage requirement or add-on, the displayed total must move by the real price difference:

- A higher specification or larger scope increases the price by the real amount.
- A lower specification or reduced scope decreases the price by the real amount.
- Removing an item removes its full calculated price.
- Increasing a quantity applies the correct per-unit price and any approved volume rule.
- Changing a billing term applies the real monthly or annual price.
- No selection may silently add `R0`.
- No configurator may keep the same total when the selected scope has changed.
- No guessed, rounded or placeholder delta may be presented as an actual price.

## Source of Truth

Every price must include the following internal metadata:

- Source supplier or internal rate card
- Supplier SKU, product ID or service code
- Supplier cost where applicable
- Display price
- Floor price
- VAT treatment
- Currency
- Price retrieval or approval date
- Expiry or next-review date
- Stock or availability status where applicable
- API response/reference ID where available

The customer sees the clean display price. Authenticated Onea staff may see supplier cost, floor price, margin and negotiation room.

## API Pricing Rules

Where a supplier offers an API, feed or authorised catalogue, Onea must consult that source carefully and use the returned price rather than a manually invented figure.

1. Retrieve the exact product and exact specification using its supplier identifier.
2. Confirm currency, VAT status, stock status and price effective date.
3. Compare suppliers where more than one approved supplier carries the product.
4. Apply the approved category-specific display and floor margins.
5. Store the source, timestamp and calculation used.
6. Reconfirm volatile pricing when the customer requests a formal quote.
7. Never expose API credentials, supplier costs or internal margins publicly.

If an API is slow or temporarily unavailable, use the most recent unexpired verified price and clearly record its age internally. If no valid price is available, show **Price unavailable - request a confirmed quote** and disable price-dependent checkout or quote finalisation.

## Required Behaviour by Pillar

### Residential and Home WiFi

Calculate from the chosen access-point model, access-point quantity, indoor and outdoor cable length, mounting equipment, installation complexity, travel, site assessment and monitoring. Each additional access point and cable metre must change the estimate using the current supplier and labour rates.

### Enterprise and Business WiFi

Calculate access points, controllers, switches, cabinets, users, VLAN work, site survey, SLA level, monitoring and support independently. Moving from 8x5 to 24x7 support must apply the approved SLA price difference immediately.

### Connectivity

Use the current ISP package price, installation charges, router cost, contract term and optional LTE backup. Package speed changes must load the exact provider price rather than applying a generic speed multiplier.

### Website and Platform Development

Price the selected build type, pages, features, CMS, e-commerce, integrations, revisions, copywriting, maintenance and hosting from the approved internal rate card. Adding or removing one page or feature must adjust the estimate by its approved rate.

### Hosting and Infrastructure

Use current xneelo or approved provider costs for the exact hosting tier, storage, bandwidth, email, SSL and backup configuration. Public pricing shows the final selling price; agent mode shows supplier cost, display margin, floor margin and negotiation band.

### System Integration

Price each connector, system, workflow step, dashboard, data migration and support requirement separately. A simple one-way sync must not carry the same price as a multi-system, multi-step automation.

### Managed IT Services

Calculate from device or user count, support window, onsite allocation, monitoring, backup, Microsoft 365 support, security coverage and SLA. Additional devices must apply the approved per-device amount, including any approved volume pricing rule.

### IT Hardware Procurement

Retrieve current pricing from approved suppliers such as Mustek, Tarsus, Pinnacle, Axiz, Syntech, Nology and relevant distributors. Compare the exact SKU and configuration, apply the approved margin and confirm price and stock again before the formal quote.

### Apple Device Procurement

Use current ASBIS Africa or another authorised distribution feed for each exact Apple SKU.

Every selectable Apple specification must map to a real product configuration:

- Product family
- Chip
- CPU/GPU configuration
- Memory
- Storage
- Screen size
- Connectivity
- Colour, only when it has a genuine price difference
- AppleCare or warranty option
- Accessories
- Setup, migration and handover services

Changing from 256GB to 512GB, 1TB or another storage tier must replace the selected SKU or apply the exact verified supplier delta. Changing memory, chip, screen size or connectivity must do the same. Moving back to a lower specification must reduce the total by the exact corresponding amount.

If the requested Apple combination does not exist as a valid supplier SKU, it must be unavailable rather than priced through an invented upgrade amount.

### Cyber Security and Fortinet

Use current Fortinet partner pricing for the exact firewall model, throughput requirement, licence bundle and term. Endpoint quantity, VPN setup, security subscription term and managed monitoring must each change the price independently.

### VoIP and Unified Communications

Use current handset, meeting-room hardware and 3CX licensing prices. Handset quantity, extension count, licence tier, sites and support must produce exact line-item changes.

### Smart CCTV and Access Control

Use the exact camera model, resolution, lens, NVR, storage drive, recording period, door hardware, installation materials and monitoring rate. Camera quantity and storage duration must recalculate the compatible recorder and storage requirements, not only multiply a generic camera allowance.

### Network Cabinets and Structured Cabling

Calculate every Cat6 or fibre link from the approved per-link model, actual cable length, indoor/outdoor cable type, trunking, patch panels, cabinet size, switch ports, labour and testing. Extra metres must use the correct per-metre rate.

### Microsoft 365 and Cloud Licensing

Use current partner pricing for the exact licence plan and billing term. Plan, licence quantity, add-ons, storage and annual/monthly billing changes must update the total using current licensing data.

### Energy and UPS

Use the exact UPS model, VA rating, battery pack, required runtime, quantity, surge protection and installation requirements. Runtime changes must select or calculate the compatible battery configuration.

### POS Hardware

Use current prices for each terminal, scanner, receipt printer, cash drawer, software licence and support item. Quantity and peripheral selections must adjust the total line by line.

### Digital Marketing

Use the approved internal rate card for the selected package, platforms, posts, content format, ad-management tier, SEO, landing pages, video, automation and reporting. Advertising spend remains separate unless explicitly included. Each add-on must have its own approved display and floor price.

### Communications and PR

Use the approved PR rate card for press release writing, distribution reach, media outreach, monitoring, reporting, crisis readiness and retainer tier. Basic, Standard and Full Communications must have defined scope, display price and floor price. Additional releases or expanded distribution must change the total immediately.

## Display Price and Floor Price

Every priced record must support:

- `display_price`: the customer-facing maximum realistic market anchor
- `floor_price`: the internal minimum acceptable price
- `negotiation_band`: display price minus floor price
- `supplier_cost`: internal only where applicable
- `display_margin`: internal only
- `floor_margin`: internal only

No public API response, page source, analytics payload or customer quote request may expose floor price, supplier cost or internal margin.

## Validation Before Release

Every configurator must pass a price-movement test:

1. Record the starting configuration and total.
2. Change one option only.
3. Confirm the total changes in the correct direction.
4. Confirm the difference equals the source price or approved rate-card delta.
5. Reverse the change and confirm the original total returns exactly.
6. Repeat for minimum, maximum and unavailable configurations.
7. Verify public mode exposes only display pricing.
8. Verify authenticated agent mode shows source, floor and negotiation information.

The configurator is not ready for launch if any selectable item has no price source, produces no change, produces a guessed change, exposes internal pricing or cannot reproduce its calculation.

## Final Instruction

Do not rush a false price into production. Take the time to consult the authorised API, supplier feed or approved Onea rate card. Accuracy is more important than making every option appear available.

Onea will sell with confidence by showing customers a real price, responding precisely to every change and preserving a clear, auditable path from source cost to final selling price.
