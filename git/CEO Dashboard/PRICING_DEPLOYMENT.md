# Onea Real-Life Pricing Deployment

## What is implemented

- One central protected rate card for all 10 public tiers and 23 Solution Builders.
- Display prices, floor prices, availability, pricing source and margin policies.
- Small option, quantity and specification changes recalculate totals up or down.
- Public responses never include floors, supplier costs or margin policies.
- Non-API services and common hardware classes use approved Onea market anchors with a visible estimate-tolerance range.
- Exact Apple SKUs still fail closed when the ASBIS feed cannot return a verified price.
- Apple products use exact ASBIS SKU, cost and stock records. The selected SKU and quantity change the price.
- ASBIS and Nology operational searches require an authenticated Launch Platform session.
- Scheduled refresh health for ASBIS, Microsoft, Fortinet and hosting feeds.
- Authenticated internal pricing report at `/api/pricing-report.php`.
- Protected Onea delivery-role rates, commercial rules and builder-to-team mappings.
- Automated catalogue, floor and reversible quantity tests.

## Upload to xneelo

Upload **everything inside** `dist-ready` into `public_html`.

Important pricing files included in that upload:

- `api/pricing-catalog.php`
- `api/pricing-report.php`
- `api/pricing-refresh.php`
- `api/apple-prices.php`
- `api/asbis-products.php`
- `api/nology-products.php`
- `api/data/pricing-rate-card.json`
- `api/data/.htaccess`
- `api/.htaccess`
- all generated files under `assets`

Do not upload the `dist-ready` folder as another folder under `public_html`. Upload its contents so `index.html`, `assets` and `api` sit directly inside `public_html`.

Keep the real `onea-config.php` in the hosting home directory, one level above `public_html`.

## Required xneelo configuration

Set these values in the private `onea-config.php` file:

```php
'APP_URL' => 'https://onea.africa',
'ASBIS_USERNAME' => 'ROTATED_VALUE',
'ASBIS_PASSWORD' => 'ROTATED_VALUE',
'NOLOGY_USERNAME' => 'ROTATED_VALUE',
'NOLOGY_SECRET' => 'ROTATED_VALUE',
'PRICING_CRON_SECRET' => 'LONG_RANDOM_VALUE',
```

Configure partner feeds when Onea receives the real endpoint and schema:

```php
'MICROSOFT_PRICE_FEED_URL' => '',
'MICROSOFT_PRICE_FEED_TOKEN' => '',
'FORTINET_PRICE_FEED_URL' => '',
'FORTINET_PRICE_FEED_TOKEN' => '',
'HOSTING_PRICE_FEED_URL' => '',
'HOSTING_PRICE_FEED_TOKEN' => '',
```

Never place these values in `public_html`, React source, JavaScript, Git or screenshots.

## Scheduled refresh

Create an xneelo cron job that calls:

```text
https://onea.africa/api/pricing-refresh.php?secret=PRICING_CRON_SECRET
```

Recommended schedule: every 30 minutes. The endpoint records refresh health in the protected API data directory.

## Pricing-source status

| Pricing area | Current behavior |
| --- | --- |
| Apple | Real ASBIS ProductList and PriceAvail SKU pricing |
| General ASBIS hardware | Real authenticated ASBIS search |
| Nology hardware | Real authenticated Nology search |
| Onea labour and services | Central internal rate card with display and floor prices |
| Microsoft licensing | Public Microsoft anchor plus Onea administration; CSP feed replaces the allowance when supplied |
| Fortinet | Business firewall market allowance plus Onea implementation; partner feed improves exact SKU precision |
| Hosting and domains | Current xneelo VAT-inclusive public prices with a fixed 20% Onea markup; registration and renewal are priced separately by extension |
| Other hardware suppliers | Approved market allowances with higher tolerance until a current supplier feed or import is supplied |

The system separates approved market anchors from exact supplier-fed prices. The estimate shows its expected adjustment tolerance, while exact Apple SKU selection still requires current ASBIS data.

## Release checks

Run before every deployment:

```powershell
npm run pricing:sync
npm run test:pricing
npx tsc --noEmit
npx vite build --outDir dist-ready --emptyOutDir
```

After deployment, confirm:

1. `/api/pricing-catalog.php` returns public display prices without floors.
2. `/api/pricing-report.php` and `/api/health.php` return `401` when logged out.
3. `/api/data/pricing-rate-card.json` returns `403`.
4. Apple SKU searches return current ASBIS prices.
5. Hosting and all published xneelo domain extensions apply exactly 20% markup.
6. Increasing and decreasing a quantity restores the exact previous total.
7. Quote-required options cannot be selected as if they have a verified price.

## Remaining external dependencies

These cannot be completed accurately from code alone:

- Rotated production supplier credentials entered in xneelo.
- Microsoft CSP feed access and its exact response schema.
- Fortinet partner feed access and its exact response schema.
- Hosting wholesale price feed or approved import.
- Approved feeds or structured price files for Mustek, Tarsus, Pinnacle, Axiz, Syntech, MiRO and other suppliers Onea chooses to use.
- Neo's formal approval of floor margins and negotiation bands.
- Production PHP syntax and endpoint testing on xneelo because PHP is not installed on this workstation.
