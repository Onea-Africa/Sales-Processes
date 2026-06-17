# Telkom Consumer Application Form - Production Setup Guide

## Overview

This document describes the complete setup, configuration, and deployment of the production-ready Telkom Consumer Application form processing system.

### System Components

1. **Frontend:** React/TypeScript component (`TelkomPortal.tsx`)
2. **Backend:** PHP processing script (`sendmail-telkom.php`)
3. **Dependencies:** FPDF/FPDI for PDF overlay
4. **Integrations:** Google Sheets, WhatsApp, Xneelo email

---

## Part 1: Frontend Setup

### TelkomPortal Component

The frontend form is implemented in:
```
src/components/telkom/TelkomPortal.tsx
```

#### Features

- **4-page multi-step form** with validation
- **15 product packages** with automatic price mapping
- **3 signature capture canvases** (payment, services, agreement)
- **Responsive Tailwind CSS** styling
- **Real-time field validation**
- **Automatic form data serialization** to JSON

#### Key Form Sections

**Page 1:** Customer Details + Employment Details
- Title, Surname, First Names, Gender, ID/Passport
- Contact details (home, office, mobile, email)
- Physical address, Postal address, Delivery address
- Company name, contact, address, income details

**Page 2:** Payment Details + Signature #1
- Bank details (name, branch, branch code, account holder)
- Account number (marked for phone collection - always ".")
- Debit order maximum amount and date
- Authorization full name and date
- Signature capture (canvas)

**Page 3:** Services Required + Signature #2
- Technology type (DSL, Fibre, LTE, 3G)
- Service date, lines required, use existing line
- Current service provider, preferred network operator
- Package selection (15 package options)
- Deal ID, description, contract period
- Self-install option
- Signing full name, date, and signature capture

**Page 4:** Agreement & Terms + Signature #3
- Full T&C declaration text
- Credit vetting consent checkbox
- T&C copy request (printed/emailed)
- Confirmation email (if emailed option)
- Final signature capture

#### Form Submission Flow

```javascript
// Frontend sends JSON payload to /sendmail.php
const payload = {
  // Section 1
  existingCustomer: "Y/N",
  title: "Mr",
  surname: "Smith",
  firstNames: "John",
  // ... all form fields ...
  
  // Signature data URLs (Base64)
  sig1: "data:image/png;base64,...",
  sig2: "data:image/png;base64,...",
  sig3: "data:image/png;base64,...",
  
  formType: "telkom-application"
};
```

---

## Part 2: Backend Setup

### 1. Install FPDF/FPDI Libraries

Download FPDF and FPDI and place in `public/api/`:

```bash
# FPDF (6.0 KB)
cd public/api
wget https://github.com/setasign/FPDF/archive/refs/tags/2.0.2.zip
unzip 2.0.2.zip
mv FPDF-2.0.2 fpdf

# FPDI (Latest)
wget https://github.com/setasign/FPDI/archive/refs/tags/v2.3.6.zip
unzip v2.3.6.zip
mv FPDI-2.3.6 fpdi
```

Or manually:
1. Download from [FPDF.de](http://fpdf.de)
2. Download from [FPDI GitHub](https://github.com/setasign/FPDI)
3. Extract to `public/api/fpdf` and `public/api/fpdi`

### 2. Directory Structure

```
public/
├── sendmail.php                    (original handler - routes to sendmail-telkom.php)
├── sendmail-telkom.php             (FPDF/FPDI overlay script)
├── data/
│   ├── telkom-submissions/         (JSON records)
│   ├── pdfs/                       (Generated PDFs)
│   └── telkom-*.pdf               (Application PDFs)
├── uploads/
│   └── telkom-sigs/               (Temporary signature images)
└── api/
    ├── _common.php                (helper functions)
    ├── fpdf/                      (FPDF library)
    └── fpdi/                      (FPDI library)
```

### 3. Create Required Directories

```bash
mkdir -p public/data/telkom-submissions
mkdir -p public/uploads/telkom-sigs
chmod 755 public/data
chmod 755 public/uploads
```

### 4. PHP Helper Functions (_common.php)

Ensure these functions exist in `public/api/_common.php`:

```php
function get_env(string $key, string $default = ''): string;
function sanitize(string $value): string;
function is_post_request(): bool;
function respond(array $data, int $statusCode = 200): void;
function append_to_sheet(array $values, string $sheetName): bool;
function save_submission_json(string $dir, array $data): bool;
function send_html_email(...): bool;
```

---

## Part 3: Configuration

### Xneelo Email Settings

Update environment variables:

```bash
# .env or via system environment
MAIL_FROM="webforms@onea.co.za"
MAIL_PASSWORD="[Xneelo SMTP password]"
MAIL_HOST="smtp.xneelo.co.za"
MAIL_PORT="587"
MAIL_ENCRYPTION="tls"

# Google Sheets
GOOGLE_SHEETS_API_KEY="[Your API key]"
GOOGLE_SHEET_ID="[Your sheet ID]"

# WhatsApp Integration
WHATSAPP_WEBHOOK_URL="[Your WhatsApp webhook URL]"
WHATSAPP_WEBHOOK_SECRET="[Shared secret]"
```

### Email Routing Rules

The system uses:

- **From:** `webforms@onea.co.za` (Authorized Xneelo domain)
- **To:** `sales@onea.co.za` (Telkom applications)
- **Reply-To:** `{customer_email}` (Extracted from form)
- **SPF Compliance:** Using @onea.co.za domain (not @gmail.co.za)

### Google Sheets Integration

Sheet name: `ISP_TRACKING`

Columns:
```
A: Timestamp (YYYY-MM-DD HH:MM:SS)
B: Customer Name
C: Address (physical address)
D: ISP Type (DSL/Fibre/LTE/3G)
E: ISP Partner (Openserve/3rd party)
F: Package Name
G: Speed/Spec
H: Monthly Value (R)
```

### WhatsApp Webhook

Payload format:
```json
{
  "phone": "+27694644663",
  "message": "📱 New Telkom Lead:\nName: John Smith\nPhone: 0827654321\nPackage: Telkom Endless Fibre 100/100 Mbps\nMonthly: R1025\nRef: TELKOM-A1B2C3D4"
}
```

---

## Part 4: Field Mapping & Coordinate System

### PDF Overlay Coordinates

The system uses **absolute XY coordinates in millimeters (mm)** from the top-left corner of each page.

#### PAGE 1: Customer Details (297mm x 210mm - A4 Landscape)

| Field | X (mm) | Y (mm) | Note |
|-------|--------|--------|------|
| Existing Customer (Y/N) | 95 | 40 | Single character |
| Existing Number | 147 | 40 | If Customer = Y |
| Coverage Checked (Y/N) | 95 | 48 | Y/N |
| Title | 55 | 56 | Mr/Ms/Dr |
| Surname | 100 | 56 | Last name |
| First Names | 147 | 56 | First/middle names |
| SA Citizen (Y/N) | 87 | 64 | Y/N |
| Gender (M/F) | 148 | 64 | M or F |
| ID Number | 122 | 64 | ID or Passport |
| Passport Number | 55 | 72 | Full passport no. |
| Passport Expiry | 147 | 72 | YYYY-MM-DD |
| Home Number | 80 | 80 | Contact phone |
| Office Number | 147 | 80 | Contact phone |
| Mobile Number | 80 | 88 | Primary contact |
| Alternate Mobile | 147 | 88 | Secondary contact |
| Email Address | 55 | 96 | Valid email |
| Physical Address | 55 | 104 | Street/Unit |
| Suburb | 70 | 112 | Suburb |
| City | 135 | 112 | City/Town |
| Postal Address (Same?) | 75 | 120 | Y/N |
| PO Box/P Bag | 130 | 120 | If not same |
| Postal Suburb/City | 70 | 128 | If not same |
| Postal Code | 155 | 128 | Postal code |
| Delivery Address | 55 | 136 | Street/Unit |
| Delivery City | 135 | 144 | City/Town |
| Delivery Postal Code | 155 | 144 | Postal code |
| Company Name | 55 | 160 | Employer name |
| Company Contact | 155 | 160 | Phone |
| Company Address | 55 | 168 | Street address |
| Company Suburb | 70 | 176 | Suburb |
| Company City | 135 | 176 | City |
| Company Postal Code | 155 | 176 | Code |
| Gross Income p/m | 90 | 184 | R amount |
| Net Income p/m | 155 | 184 | R amount |
| Total Expenses p/m | 90 | 192 | R amount |
| Household Income p/m | 155 | 192 | R amount |
| Bank | 55 | 208 | Bank name |
| Branch Name | 127 | 208 | Branch |
| Branch Code | 175 | 208 | Code |
| Account Holder | 55 | 216 | Full name |
| Account Number | 147 | 216 | **ALWAYS "."** |
| Account Type | 65 | 224 | Cheque/Transmission/Savings |
| Debit Max Amount | 85 | 232 | R amount |
| Debit Date | 120 | 232 | 5th/15th/20th/25th/Last |
| Auth Full Name | 55 | 256 | Signature name |
| Auth Date | 147 | 256 | YYYY-MM-DD |
| **Signature Image 1** | 55 | 264 | 40mm wide x 20mm high |

#### PAGE 2: Services & Payment Signature (A4 Landscape)

| Field | X (mm) | Y (mm) | Note |
|-------|--------|--------|------|
| Technology Type | 85 | 40 | DSL/Fibre/LTE/3G |
| Required Service Date | 155 | 40 | YYYY-MM-DD |
| Lines Required | 70 | 48 | Number |
| Use Existing Line (Y/N) | 105 | 48 | Y/N |
| Service Number | 130 | 56 | If Y, otherwise "." |
| Current Service Provider | 55 | 64 | Provider name |
| Preferred Network Operator | 135 | 64 | Openserve/3rd party |
| Deal ID | 65 | 80 | Deal identifier |
| Deal Description | 127 | 80 | Description |
| Internet Plan (Package) | 70 | 104 | Full package name |
| Contract Period | 160 | 120 | MtM/12/24/36 |
| Self-Install (Y/N) | 75 | 136 | Y/N |
| Signing Full Name | 55 | 160 | Signature name |
| Signing Date | 147 | 160 | YYYY-MM-DD |
| **Signature Image 2** | 55 | 168 | 40mm wide x 20mm high |

#### PAGE 3: Agreement & Final Signature (A4 Landscape)

| Field | X (mm) | Y (mm) | Note |
|-------|--------|--------|------|
| Credit Vetting Consent (Y/N) | 75 | 40 | Y/N |
| T&C Copy Request (Y/N) | 75 | 200 | Y/N |
| Delivery Method | 100 | 210 | Printed/Emailed (if Y) |
| Confirmation Email | 80 | 220 | If Emailed |
| Agreement Full Name | 55 | 240 | Signature name |
| Agreement Date | 147 | 240 | YYYY-MM-DD |
| **Signature Image 3** | 55 | 248 | 40mm wide x 20mm high |

### Empty Field Rule (The "." Replacement)

**STRICT RULE:** If any field is empty or missing from the POST payload:

- Do **NOT** print `"(?)"` or `"(-)"` or dashes
- Print only a single **dot `"."`**
- Exception: Account Number field is **ALWAYS "."** (system collects via phone)

Example:
```php
// Frontend doesn't send homeNumber
$homeNumber = ''; // Empty in $_POST

// Backend outputs:
$overlayText(80, 80, placeholder($homeNumber)); // Outputs: "."
```

---

## Part 5: Email Headers (Xneelo SPF Compliance)

The sendmail-telkom.php script uses:

```php
$headers = "From: webforms@onea.co.za\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
$headers .= "X-Mailer: Onea Application System\r\n";
```

This ensures:
- ✅ SPF record passes (using @onea.co.za domain)
- ✅ Client email in Reply-To (not From)
- ✅ PDF attachment included
- ✅ HTML formatting preserved

---

## Part 6: Testing

### Manual Test (cURL)

```bash
curl -X POST http://localhost:5173/sendmail.php \
  -H "Content-Type: application/json" \
  -d '{
    "existingCustomer": "N",
    "title": "Mr",
    "surname": "Smith",
    "firstNames": "John",
    "mobileNumber": "0827654321",
    "email": "john@example.com",
    "physicalAddress": "123 Main Street",
    "suburb": "Johannesburg",
    "city": "Johannesburg",
    "bank": "FNB",
    "branchName": "Main Branch",
    "accountHolderName": "John Smith",
    "debitOrderMaxAmount": "2000",
    "authFullName": "John Smith",
    "executionDate": "2026-05-21",
    "technologyType": "Fibre",
    "requiredServiceDate": "2026-06-01",
    "selectedPackage": "Telkom Endless Fibre 100/100 Mbps",
    "packagePrice": "1025",
    "signingFullName": "John Smith",
    "signingDate": "2026-05-21",
    "creditVettingConsent": "Y",
    "sig1": "data:image/png;base64,...",
    "sig2": "data:image/png;base64,...",
    "sig3": "data:image/png;base64,...",
    "formType": "telkom-application"
  }'
```

### Expected Response

```json
{
  "message": "Your Telkom application has been submitted successfully.",
  "id": "TELKOM-A1B2C3D4",
  "timestamp": "2026-05-21 14:30:45",
  "recipient": "sales@onea.co.za"
}
```

### Validation Checklist

- [x] All 3 signatures captured and written to disk
- [x] PDF generated with field overlays
- [x] Email sent to sales@onea.co.za
- [x] Reply-To header set to customer email
- [x] PDF attachment included
- [x] Empty fields show "." not "(?)"
- [x] Account number always "."
- [x] Google Sheets row appended (ISP_TRACKING)
- [x] WhatsApp message sent (+27 69 464 4663)
- [x] JSON submission record saved
- [x] Submission ID returned in response

---

## Part 7: Troubleshooting

### Issue: "Failed to process signature images"

**Cause:** Base64 data URL parsing failed

**Solution:**
```php
// Check signature data format
// Should be: data:image/png;base64,iVBORw0KGgo...
// Or raw base64: iVBORw0KGgo...
```

### Issue: "Failed to create PDF file"

**Cause:** FPDF/FPDI not installed or permissions issue

**Solution:**
```bash
# Verify installation
ls -la public/api/fpdf/
ls -la public/api/fpdi/

# Fix permissions
chmod 755 public/data
chmod 755 public/uploads
```

### Issue: Email not received

**Cause:** SPF/DKIM/DMARC issues with Xneelo

**Solution:**
1. Verify `webforms@onea.co.za` is valid email account on Xneelo
2. Check SPF record: `v=spf1 include:xneelo.co.za ~all`
3. Verify DKIM keys are configured
4. Check PHP mail() configuration in php.ini

### Issue: Google Sheets not logging

**Cause:** Missing API key or webhook

**Solution:**
```bash
# Verify environment variables
echo $GOOGLE_SHEETS_API_KEY
echo $GOOGLE_SHEET_ID

# Test webhook
curl -X POST [WEBHOOK_URL] -d '{"test": "data"}'
```

---

## Part 8: Production Deployment

### Pre-deployment Checklist

- [x] FPDF/FPDI libraries installed in `public/api/`
- [x] All required directories exist with proper permissions (755)
- [x] Environment variables configured (.env)
- [x] Xneelo SMTP credentials verified
- [x] Google Sheets API key configured
- [x] WhatsApp webhook URL active
- [x] SSL certificate installed (HTTPS)
- [x] Database backed up (if using)
- [x] Log rotation configured (telkom_errors.log)

### Deployment Steps

1. **Install dependencies**
   ```bash
   # Download FPDF/FPDI as per Part 2
   ```

2. **Create directories**
   ```bash
   mkdir -p public/data/telkom-submissions
   mkdir -p public/uploads/telkom-sigs
   chmod 755 public/data public/uploads
   ```

3. **Configure environment**
   ```bash
   # Edit .env or system environment
   # Add Xneelo, Google Sheets, WhatsApp credentials
   ```

4. **Test form submission**
   ```bash
   # Use cURL test from Part 6
   ```

5. **Verify email delivery**
   ```bash
   # Check sales@onea.co.za inbox
   # Verify PDF attachment present
   ```

6. **Monitor logs**
   ```bash
   tail -f public/telkom_errors.log
   tail -f public/data/webhook-fallbacks/status.json
   ```

---

## Part 9: Signature Capture Component

The frontend uses a custom `SignaturePad` component for capturing signatures.

### Implementation (SignaturePad.tsx)

```typescript
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

const SignaturePad = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    toDataURL: (format: string = 'image/png') => {
      return canvasRef.current?.toDataURL(format) || '';
    },
    isEmpty: () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return true;
      const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
      return data.every(pixel => pixel === 0 || pixel === 255);
    },
    clear: () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }));

  const handleMouseDown = () => {
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={150}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full border border-gray-300 cursor-crosshair bg-white"
    />
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
```

---

## Support & Maintenance

For issues or updates:
1. Check `public/telkom_errors.log` for detailed error messages
2. Review Google Sheets webhook status in `public/data/webhook-fallbacks/`
3. Test email delivery using the cURL example in Part 6
4. Verify signature file count in `public/uploads/telkom-sigs/`

**Key Files to Monitor:**
- `public/telkom_errors.log` - Error log
- `public/data/telkom-submissions/*.json` - Submission records
- `public/data/telkom-*.pdf` - Generated PDFs

---

*Generated: May 21, 2026*  
*Version: 1.0.0 - Production Ready*
