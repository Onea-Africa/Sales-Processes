# Onea Credential Rotation and PHP Security Deployment

## 1. Rotate credentials before deploying

Treat every value previously stored in the repository as compromised.

1. ASBIS: reset the IT4Profit password for the Onea account.
2. Nology: revoke the old data-feed secret and issue a new secret.
3. Google Cloud: disable/delete the exposed service-account key and create a new key only if the integration still requires one.
4. Rotate webhook secrets, HubSpot tokens, SMTP credentials and admin passwords if they were ever shared in files or deployment archives.
5. Do not reuse any old value.

## 2. Configure the hosting environment

Copy `onea-config.example.php`, rename the copy to `onea-config.php`, fill in the real values, and upload it to the xneelo Home Directory one level above `public_html`. Do not place it inside `public_html`.

Required supplier variables:

```text
ASBIS_USERNAME
ASBIS_PASSWORD
NOLOGY_USERNAME
NOLOGY_SECRET
```

Copy the remaining variable names from `hosting.env.example`. Never upload that file with real values.

Generate strong values with PowerShell:

```powershell
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

## 3. Purge old files from Git history

Run this only from a clean clone of the repository after all current work is committed and backed up. This rewrites every branch and tag, so coordinate with every contributor.

Install `git-filter-repo`, then run from the repository root:

```powershell
git filter-repo --force --invert-paths `
  --path "git/CEO Dashboard/service-account.json.json" `
  --path "git/CEO Dashboard/public/api/_asbis-credentials.php" `
  --path "git/CEO Dashboard/public/api/_nology-credentials.php" `
  --path "git/CEO Dashboard/public/api/data/asbis-credentials.php"

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all origin
git push --force --tags origin
```

All collaborators must re-clone after the force push. Git history cleanup does not invalidate copied secrets, which is why rotation must happen first.

## 4. Enable malware scanning

The application validates file size, extension-independent MIME type and PDF magic bytes. To require antivirus scanning, ask the host to provide ClamAV/`clamdscan`, test the command, then configure:

```text
CLAMAV_SCAN_COMMAND=clamdscan --no-summary
FILE_MALWARE_SCAN_REQUIRED=1
```

Keep `FILE_MALWARE_SCAN_REQUIRED=0` until the command is confirmed. Setting it to `1` without a working scanner intentionally blocks uploads.

## 5. Deploy and verify

1. Back up the current site and API data.
2. Deploy the new build and `.htaccess` files.
3. Confirm `/api/health.php` returns `401` without authentication and `200` with a valid Launch Platform bearer token.
4. Confirm `/api/webhook-status.php` returns `401` without a bearer token.
5. Confirm deleted credential URLs return `403` or `404`.
6. Submit one test enquiry, careers application, support request and Telkom application.
7. Confirm oversized or renamed non-PDF uploads are rejected.
8. Confirm a signing link expires and a revoked link returns `410`.
9. Confirm `Content-Security-Policy` and `Permissions-Policy` are present.
10. Review PHP and Apache logs for blocked scripts or integrations before announcing the relaunch.
