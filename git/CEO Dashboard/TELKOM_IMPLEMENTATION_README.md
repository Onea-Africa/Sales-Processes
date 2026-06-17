# Telkom Consumer Application Form - Production Implementation

## Quick Start Overview

This repository contains a **production-ready, full-stack Telkom Consumer Application form processor** with:

### Frontend (React/TypeScript)
- **TelkomPortal.tsx** - 4-page multi-step form with comprehensive validation
- **SignaturePad.tsx** - Canvas-based signature capture (3 signatures)
- Tailwind CSS styling (responsive, mobile-optimized)
- 15 pre-configured internet packages with automatic pricing
- Real-time form validation with error messaging

### Backend (PHP)
- **sendmail-telkom.php** - Production-ready FPDF/FPDI overlay processor
- **sendmail.php** - Intelligent request router (Telkom vs. generic)
- Strict "." placeholder rule for empty fields
- 3-page PDF template overlay with absolute coordinates
- Email routing to sales@onea.co.za (Xneelo SPF-compliant)
- Google Sheets integration (ISP_TRACKING)
- WhatsApp webhook notifications (+27 69 464 4663)

---

## File Structure

```
CEO Dashboard/
├── src/
│   └── components/
│       └── telkom/
│           ├── TelkomPortal.tsx          ✅ 4-page form component
│           └── SignaturePad.tsx          ✅ Signature capture canvas
│
├── public/
│   ├── sendmail.php                     ✅ Router (Telkom/generic detection)
│   ├── sendmail-telkom.php              ✅ FPDF/FPDI overlay processor
│   ├── data/
│   │   ├── telkom-submissions/          📁 JSON submission records
│   │   └── telkom-*.pdf                 📁 Generated PDFs
│   ├── uploads/
│   │   └── telkom-sigs/                 📁 Signature images (temp)
│   └── api/
│       ├── _common.php                  📄 Helper functions
│       ├── fpdf/                        📁 FPDF library (download needed)
│       └── fpdi/                        📁 FPDI library (download needed)
│
├── TELKOM_SETUP_GUIDE.md                ✅ Detailed setup instructions
└── README.md                            📄 This file
```

---

## Installation & Deployment

### Step 1: Clone/Update Repository

```bash
cd CEO Dashboard
git pull origin main
```

### Step 2: Install FPDF/FPDI Libraries

**Option A: Download & Extract**

1. Download FPDF 2.0+ from http://www.fpdf.de
2. Download FPDI 2.3+ from https://github.com/setasign/FPDI
3. Extract to:
   ```
   public/api/fpdf/
   public/api/fpdi/
   ```

**Option B: Composer (if available)**

```bash
cd public/api
composer require fpdf/fpdf
composer require setasign/fpdi
```

### Step 3: Create Required Directories

```bash
mkdir -p public/data/telkom-submissions
mkdir -p public/uploads/telkom-sigs
mkdir -p public/data/webhook-fallbacks

chmod 755 public/data
chmod 755 public/uploads
chmod 755 public/data/webhook-fallbacks
```

### Step 4: Configure Environment Variables

Create `.env` or update system environment:

```env
# Xneelo SMTP (Email)
MAIL_HOST=smtp.xneelo.co.za
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_FROM=webforms@onea.co.za
MAIL_PASSWORD=your_xneelo_password

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_SHEET_ID=your_spreadsheet_id

# WhatsApp Integration
WHATSAPP_WEBHOOK_URL=https://your-webhook-url.com/whatsapp
WHATSAPP_WEBHOOK_SECRET=your_shared_secret
```

### Step 5: Verify Installation

```bash
# Check directories exist
ls -la public/data/telkom-submissions
ls -la public/uploads/telkom-sigs

# Check FPDF/FPDI
ls -la public/api/fpdf
ls -la public/api/fpdi

# Test form submission
curl -X POST http://localhost:5173/sendmail.php \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

## How It Works

### 1. Frontend Form Submission

**File:** `src/components/telkom/TelkomPortal.tsx`

User fills out 4-page form:
- **Page 1:** Customer details + Employment
- **Page 2:** Payment details + Signature #1
- **Page 3:** Services + Signature #2
- **Page 4:** Agreement + Signature #3

Form data is serialized to JSON with 3 signature images as Base64 data URLs:

```javascript
{
  // Section 1: Customer Details
  existingCustomer: "Y",
  title: "Mr",
  surname: "Smith",
  firstNames: "John",
  // ... more fields ...
  
  // Section 2: Employment
  companyName: "Acme Corp",
  grossIncome: "75000",
  // ... more fields ...
  
  // Section 3: Payment & Signature #1
  bank: "FNB",
  accountHolderName: "John Smith",
  authFullName: "John Smith",
  executionDate: "2026-05-21",
  sig1: "data:image/png;base64,iVBORw0KG...",
  
  // Section 5: Services & Signature #2
  technologyType: "Fibre",
  selectedPackage: "Telkom Endless Fibre 100/100 Mbps",
  packagePrice: "1025",
  signingFullName: "John Smith",
  signingDate: "2026-05-21",
  sig2: "data:image/png;base64,iVBORw0KG...",
  
  // Section 6: Agreement & Signature #3
  creditVettingConsent: "Y",
  tcCopyRequest: "N",
  sig3: "data:image/png;base64,iVBORw0KG...",
  
  formType: "telkom-application"
}
```

### 2. Backend Processing

**File:** `public/sendmail.php` (Router)

Routes request to appropriate handler:
```php
// Detect Telkom application
if ($isTelkomApplication) {
    require __DIR__ . '/sendmail-telkom.php';
    exit(0);
}
```

**File:** `public/sendmail-telkom.php` (Processor)

1. **Validate Signatures** - All 3 must be present (Base64)
2. **Write Signature Files** - Decode and save to `uploads/telkom-sigs/`
3. **Extract Form Data** - Apply placeholder "." for empty fields
4. **Generate PDF** - FPDF/FPDI overlay on 3-page template
   - Page 1: Customer details (coordinates)
   - Page 2: Services (coordinates)
   - Page 3: Agreement (coordinates)
5. **Send Email** - to sales@onea.co.za with PDF attachment
6. **Log to Google Sheets** - ISP_TRACKING sheet
7. **Send WhatsApp** - Notification to +27 69 464 4663
8. **Save Record** - JSON submission file

### 3. Output Files

**Generated Files:**

```
public/data/
├── telkom-XXXX-XXXX.pdf              ← PDF with overlaid form data
└── telkom-submissions/
    └── TELKOM-XXXX-XXXX.json         ← Submission metadata

public/uploads/telkom-sigs/
├── sig1_[timestamp].png              ← Payment authorization signature
├── sig2_[timestamp].png              ← Services signature
└── sig3_[timestamp].png              ← Agreement signature
```

**Email Recipient:** sales@onea.co.za
**Email From:** webforms@onea.co.za
**Reply-To:** {customer_email}

---

## The "." Placeholder Rule

**CRITICAL RULE:** If any frontend field is empty or missing:

❌ Do NOT output: `(?)`  
❌ Do NOT output: `(-)`  
❌ Do NOT output: `[blank space]`  

✅ **ALWAYS output:** `.`

Example:
```php
// Frontend doesn't send homeNumber
$homeNumber = '';

// Backend processes:
$overlayText(80, 80, placeholder($homeNumber)); // Output: "."
```

### Exception: Account Number

The **Account Number field is ALWAYS "."** regardless of input:

```php
// INTENTIONAL - System will call customer to collect
$accountNumber = '.';
```

This ensures the template shows the agent knows to collect it via phone.

---

## Field Mapping (Coordinates)

### Page 1: Customer Details

| Field | X (mm) | Y (mm) |
|-------|--------|--------|
| Title | 55 | 56 |
| Surname | 100 | 56 |
| First Names | 147 | 56 |
| Mobile Number | 80 | 88 |
| Email | 55 | 96 |
| Physical Address | 55 | 104 |
| Suburb | 70 | 112 |
| City | 135 | 112 |
| Company Name | 55 | 160 |
| Gross Income | 90 | 184 |
| Bank | 55 | 208 |
| Account Holder | 55 | 216 |
| **Account Number** | 147 | 216 | **Always "."** |
| Debit Max Amount | 85 | 232 |
| Auth Full Name | 55 | 256 |
| **Signature #1** | 55 | 264 | 40×20mm |

### Page 2: Services

| Field | X (mm) | Y (mm) |
|-------|--------|--------|
| Technology Type | 85 | 40 |
| Required Service Date | 155 | 40 |
| Lines Required | 70 | 48 |
| Current Service Provider | 55 | 64 |
| Deal ID | 65 | 80 |
| Internet Plan (Package) | 70 | 104 |
| Contract Period | 160 | 120 |
| Signing Full Name | 55 | 160 |
| **Signature #2** | 55 | 168 | 40×20mm |

### Page 3: Agreement

| Field | X (mm) | Y (mm) |
|-------|--------|--------|
| Credit Vetting Consent | 75 | 40 |
| T&C Copy Request | 75 | 200 |
| **Signature #3** | 55 | 248 | 40×20mm |

*See TELKOM_SETUP_GUIDE.md for complete coordinate mapping*

---

## Email Routing & Headers

### SPF Compliance (Xneelo)

```php
From:    webforms@onea.co.za      ← Authorized domain
To:      sales@onea.co.za          ← Telkom sales team
Reply-To: {customer_email}          ← Client email for replies
```

**Benefits:**
- ✅ SPF record passes (using @onea.co.za domain)
- ✅ Client contact info preserved in Reply-To
- ✅ No spam filter issues
- ✅ Professional branding

### Email Content

HTML email includes:
- Customer details summary
- Employment information
- Service selection
- Contract period
- Submission reference ID
- Timestamp
- **PDF attachment** with full 3-page form + signatures

---

## Google Sheets Integration

### ISP_TRACKING Sheet

Automatically appends row for each submission:

```
Column A: Timestamp (2026-05-21 14:30:45)
Column B: Customer Name (John Smith)
Column C: Address (123 Main St, Johannesburg)
Column D: ISP Type (Fibre)
Column E: ISP Partner (Openserve)
Column F: Package (Telkom Endless Fibre 100/100 Mbps)
Column G: Speed (100/100 Mbps)
Column H: Monthly Value (1025)
```

**Setup:**
1. Create spreadsheet with columns A-H
2. Get API key from Google Cloud Console
3. Share spreadsheet with API service account
4. Set `GOOGLE_SHEETS_API_KEY` and `GOOGLE_SHEET_ID` environment vars

---

## WhatsApp Notifications

### Webhook Notification

Sends to: **+27 69 464 4663**

Message format:
```
📱 New Telkom Lead:
Name: John Smith
Phone: 0827654321
Package: Telkom Endless Fibre 100/100 Mbps
Monthly: R1025
Ref: TELKOM-A1B2C3D4
```

**Setup:**
1. Create WhatsApp webhook endpoint (or use service like Twilio)
2. Configure webhook URL: `WHATSAPP_WEBHOOK_URL`
3. Set shared secret: `WHATSAPP_WEBHOOK_SECRET`

---

## Package Options (15 Packages)

All automatically extracted from frontend selection:

```
1. Telkom Core Fibre Lite 50/25 Mbps           - R695
2. Telkom Core Fibre 100/50 Mbps               - R895
3. Telkom Endless Fibre 50/50 Mbps             - R805
4. Telkom Endless Fibre 100/100 Mbps           - R1025
5. Telkom Endless Fibre 200/100 Mbps           - R1299
6. Telkom Endless Fibre 200/200 Mbps           - R1365
7. Telkom Stream Connect 50/25 Mbps            - R695
8. Telkom Stream Connect 100/50 Mbps           - R895
9. Telkom Stream Connect 200/100 Mbps          - R1299
10. Telkom Easy Connect 20/10 Mbps             - R345
11. Telkom Easy Connect 40/20 Mbps             - R425
12. Telkom Prepaid Easy Connect                - R50
13. Telkom Prepaid Stream Connect              - R50
14. Telkom LTE 25GB (12.5GB + 12.5GB Night)   - R109
15. Telkom LTE 45GB (22.5GB + 22.5GB Night)   - R199
```

---

## Testing

### 1. Manual Frontend Test

```bash
# Start dev server
npm run dev

# Navigate to form
# http://localhost:5173/[form-page]

# Fill out all sections
# Capture 3 signatures
# Submit
```

### 2. API Test (cURL)

```bash
curl -X POST http://localhost:5173/sendmail.php \
  -H "Content-Type: application/json" \
  -d '{
    "existingCustomer": "N",
    "title": "Mr",
    "surname": "Smith",
    "firstNames": "John",
    "saCitizen": "Y",
    "gender": "M",
    "mobileNumber": "0827654321",
    "email": "john@example.com",
    "physicalAddress": "123 Main Street",
    "suburb": "Johannesburg",
    "city": "Johannesburg",
    "companyName": "Tech Corp",
    "grossIncome": "75000",
    "netIncome": "60000",
    "bank": "FNB",
    "branchName": "Main Branch",
    "branchCode": "250155",
    "accountHolderName": "John Smith",
    "debitOrderMaxAmount": "2000",
    "debitDate": "5th",
    "authFullName": "John Smith",
    "executionDate": "2026-05-21",
    "technologyType": "Fibre",
    "requiredServiceDate": "2026-06-01",
    "linesRequired": "1",
    "useExistingLine": "N",
    "selectedPackage": "Telkom Endless Fibre 100/100 Mbps",
    "packagePrice": "1025",
    "contractPeriod": "12",
    "selfInstall": "N",
    "signingFullName": "John Smith",
    "signingDate": "2026-05-21",
    "creditVettingConsent": "Y",
    "tcCopyRequest": "N",
    "sig1": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "sig2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "sig3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "formType": "telkom-application"
  }'
```

**Expected Response:**
```json
{
  "message": "Your Telkom application has been submitted successfully.",
  "id": "TELKOM-A1B2C3D4",
  "timestamp": "2026-05-21 14:30:45",
  "recipient": "sales@onea.co.za"
}
```

### 3. Verify Output Files

```bash
# Check PDF generated
ls -la public/data/telkom-*.pdf

# Check JSON record
ls -la public/data/telkom-submissions/

# Check signatures saved
ls -la public/uploads/telkom-sigs/

# Check logs
tail -f public/telkom_errors.log
```

### 4. Check Email Delivery

- Check sales@onea.co.za inbox
- Verify PDF attachment is present
- Verify all form data visible in email

### 5. Verify Google Sheets

- Check ISP_TRACKING sheet
- Verify new row appended with correct data

### 6. Verify WhatsApp

- Check WhatsApp +27 69 464 4663 message history
- Verify message format and data accuracy

---

## Troubleshooting

### Issue: "Failed to process signature images"

**Cause:** Base64 decoding failed

**Solution:**
```php
// Debug: Check signature format
echo strlen($form['sig1']); // Should be > 1000
echo substr($form['sig1'], 0, 30); // Should start with 'data:' or be base64
```

### Issue: "Failed to create PDF file"

**Cause:** FPDF/FPDI not installed or permissions

**Solution:**
```bash
# Verify libraries
ls -la public/api/fpdf/src/Fpdf.php
ls -la public/api/fpdi/src/Fpdi.php

# Fix permissions
chmod 755 public/data
chmod 755 public/uploads
```

### Issue: Email not received

**Cause:** SPF/SMTP misconfiguration

**Solution:**
```bash
# Test SMTP connectivity
telnet smtp.xneelo.co.za 587

# Verify webforms@onea.co.za exists on Xneelo
# Check SPF record: v=spf1 include:xneelo.co.za ~all
```

### Issue: Google Sheets not logging

**Cause:** Missing credentials or API limits

**Solution:**
```bash
# Check env vars
echo $GOOGLE_SHEETS_API_KEY
echo $GOOGLE_SHEET_ID

# Check webhook status
tail public/data/webhook-fallbacks/status.json
```

---

## Security Considerations

### 1. Input Sanitization

All form inputs are sanitized using `sanitize()` function:
```php
$surname = sanitize($form['surname']); // Strips HTML/SQL injection
```

### 2. Base64 Validation

Signatures are strictly validated:
```php
$decoded = decode_signature($data);
if (!$decoded) {
    respond(['error' => 'Invalid signature format'], 400);
}
```

### 3. File Permissions

```bash
# Restrictive permissions on generated files
chmod 644 public/data/telkom-*.pdf
chmod 700 public/uploads/telkom-sigs/
```

### 4. Error Logging

Sensitive errors logged to file (not displayed to user):
```
public/telkom_errors.log
```

### 5. Email Headers

Proper headers prevent email spoofing:
- From: webforms@onea.co.za (verified domain)
- Reply-To: customer email
- No BCC of sensitive data

---

## Production Deployment Checklist

- [ ] FPDF/FPDI libraries installed
- [ ] All required directories created with permissions (755)
- [ ] Environment variables configured (.env)
- [ ] Xneelo SMTP credentials verified
- [ ] webforms@onea.co.za email account exists
- [ ] Google Sheets API key configured
- [ ] Google sheet shared with API service account
- [ ] WhatsApp webhook endpoint active
- [ ] SSL certificate installed (HTTPS)
- [ ] DNS/SPF records configured
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Form tested end-to-end with real email
- [ ] PDF quality verified
- [ ] Team trained on system

---

## Support

For detailed setup instructions, see: **[TELKOM_SETUP_GUIDE.md](./TELKOM_SETUP_GUIDE.md)**

Key monitoring points:
- `public/telkom_errors.log` - Error log
- `public/data/telkom-submissions/` - Submission records
- `public/uploads/telkom-sigs/` - Signature images
- Google Sheets ISP_TRACKING - Lead tracking

---

## License

[Your License Here]

## Version

**Version:** 1.0.0 (Production Ready)  
**Released:** May 21, 2026  
**Status:** ✅ Production Deployment Ready
