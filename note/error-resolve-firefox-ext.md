# Firefox Extension Packaging - Error Resolution Guide

This document lists all errors and warnings encountered during the Firefox Add-ons validation process and their solutions.

---

## Table of Contents

1. [Error 1: Invalid file name in archive (unused file)](#error-1-invalid-file-name-in-archive) - Unused file `ico\1.png` rejected by validation
2. [Error 2: Invalid file name with backslashes](#error-2-invalid-file-name-with-backslashes) - Windows-style paths not compatible with Firefox
3. [Error 3: Missing strict_min_version for proxy permission](#error-3-missing-strict_min_version-for-proxy-permission) - Proxy permission requires minimum Firefox version
4. [Warning 4: Missing add-on ID](#warning-4-missing-add-on-id) - Extension ID required for identification
5. [Warning 5: Missing data_collection_permissions](#warning-5-missing-data_collection_permissions) - Data collection declaration mandatory for new extensions
6. [Warning 6: Manifest key not supported by minimum Firefox version](#warning-6-manifest-key-not-supported-by-minimum-firefox-version) - Version conflict between features
7. [Error 7: Add-on ID mismatch](#error-7-add-on-id-mismatch) - Manifest ID doesn't match AMO registration

---

## Quick Summary

| # | Type | Issue | Solution |
|---|------|-------|----------|
| 1 | Error | Unused file in archive | Remove `ico\1.png` |
| 2 | Error | Windows backslashes in paths | Use `tar` instead of `Compress-Archive` |
| 3 | Error | Missing `strict_min_version` | Set to `140.0` for desktop, `142.0` for Android |
| 4 | Warning | Missing extension ID | Add `browser_specific_settings.gecko.id` |
| 5 | Warning | Missing data collection declaration | Add `data_collection_permissions: { required: ["none"] }` |
| 6 | Warning | Version compatibility conflict | Update min version to 140.0/142.0 |
| 7 | Error | Add-on ID mismatch with AMO | Update manifest ID to match AMO registration |

---

## Error 1: Invalid file name in archive

**Error Message:**
```
Invalid file name in archive: ico\1.png
```

**Cause:**
- The file `ico\1.png` was not referenced in `manifest.json`
- Firefox validation rejects unused files in the extension package

**Solution:**
Delete the unused file:
```bash
# Remove the unused icon file
rm firefox/ico/1.png
```

**Explanation:**
Only include files that are actually used by the extension (referenced in manifest.json, HTML, CSS, or JS files).

---

## Error 2: Invalid file name with backslashes

**Error Message:**
```
Invalid file name in archive: ico\icon-128.png
```

**Cause:**
- Windows PowerShell `Compress-Archive` creates zip files with backslashes (`\`) in paths
- Firefox expects Unix-style forward slashes (`/`) in zip archives

**Solution:**
Use `tar` command instead of `Compress-Archive`:
```bash
# Wrong (creates Windows-style paths)
Compress-Archive -Path firefox/* -DestinationPath february17th-v1.0.1.zip

# Correct (creates Unix-style paths)
tar -a -cf february17th-v1.0.1.zip -C firefox .
```

**Explanation:**
Cross-platform compatibility requires Unix-style paths in zip archives, even when creating on Windows.

---

## Error 3: Missing strict_min_version for proxy permission

**Error Message:**
```
The "proxy" permission requires "strict_min_version" to be set to "91.1.0" or above
```

**Cause:**
- The `proxy` permission requires Firefox 91.1.0 or later
- `strict_min_version` was not specified in `browser_specific_settings`

**Solution:**
Add `browser_specific_settings` with minimum version:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example.com",
      "strict_min_version": "91.1.0"
    }
  }
}
```

**Explanation:**
Firefox requires explicit minimum version declaration when using certain permissions like `proxy`.

---

## Warning 4: Missing add-on ID

**Warning Message:**
```
The "/browser_specific_settings/gecko/id" property (add-on ID) should be specified in the manifest
```

**Cause:**
- Extension ID was not specified
- Required for proper extension identification and updates

**Solution:**
Add extension ID in `browser_specific_settings`:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example.com",
      "strict_min_version": "91.1.0"
    }
  }
}
```

**Explanation:**
Use format: `extensionname@yourdomain.com` or `{uuid}` format.

---

## Warning 5: Missing data_collection_permissions

**Warning Message:**
```
The "/browser_specific_settings/gecko/data_collection_permissions" property is required for all new Firefox extensions
```

**Cause:**
- As of November 3, 2025, all new Firefox extensions must declare data collection practices
- This is a mandatory field for new extensions

**Solution:**
For extensions that collect NO data:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example.com",
      "strict_min_version": "91.1.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    }
  }
}
```

For extensions that collect data:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example.com",
      "strict_min_version": "91.1.0",
      "data_collection_permissions": {
        "required": ["locationInfo"],
        "optional": ["technicalAndInteraction"]
      }
    }
  }
}
```

**Available data types:**
- `none` - No data collection
- `personallyIdentifyingInfo` - Personal information
- `healthInfo` - Health data
- `financialAndPaymentInfo` - Financial data
- `authenticationInfo` - Passwords, credentials
- `personalCommunications` - Messages, emails
- `locationInfo` - GPS, location data
- `browsingActivity` - Browsing history
- `websiteContent` - Page content
- `websiteActivity` - User interactions
- `searchTerms` - Search queries
- `bookmarksInfo` - Bookmark data
- `technicalAndInteraction` - Technical/usage data

**Reference:**
https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/

---

## Warning 6: Manifest key not supported by minimum Firefox version

**Warning Message:**
```
"strict_min_version" requires Firefox 91, which was released before version 140 introduced support for "browser_specific_settings.gecko.data_collection_permissions"

"strict_min_version" requires Firefox for Android 91, which was released before version 142 introduced support for "browser_specific_settings.gecko.data_collection_permissions"
```

**Cause:**
- `data_collection_permissions` was introduced in Firefox 140 (desktop) and Firefox 142 (Android)
- Setting `strict_min_version` to 91.1.0 creates a conflict - the extension would try to use a feature that doesn't exist in that version

**Solution:**
Update minimum versions to support `data_collection_permissions`:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example.com",
      "strict_min_version": "140.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    },
    "gecko_android": {
      "strict_min_version": "142.0"
    }
  }
}
```

**Explanation:**
- Firefox desktop 140+ is required for `data_collection_permissions`
- Firefox Android 142+ is required for `data_collection_permissions`
- The `proxy` permission (which originally required 91.1.0) is also supported in these newer versions
- Most users are on newer versions, so this is not a practical limitation

---

## Error 7: Add-on ID mismatch

**Error Message:**
```
The add-on ID in your manifest.json (february17th@example.com) does not match the ID of your add-on on AMO (february17th@example1.com)
```

**Cause:**
- When you first submitted the extension to AMO (addons.mozilla.org), it was registered with a specific ID
- The ID in your manifest.json must exactly match the ID registered on AMO
- This prevents someone from hijacking your extension by uploading a different extension with the same ID

**Solution:**
Update the manifest.json to match the AMO registration:
```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example1.com",  // Must match AMO
      "strict_min_version": "140.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    }
  }
}
```

**How to find your AMO ID:**
1. Log in to addons.mozilla.org
2. Go to "Manage My Submissions"
3. Click on your extension
4. The ID is shown in the extension details

**Explanation:**
Once an extension is registered on AMO, its ID is locked and cannot be changed. All future updates must use the exact same ID.

---

## Final Working manifest.json

```json
{
  "manifest_version": 2,
  "name": "february17th",
  "version": "1.0.1",
  "description": "Routes domains through local SOCKS proxy (127.0.0.1:1080). No data collection.",
  
  "browser_specific_settings": {
    "gecko": {
      "id": "february17th@example1.com",
      "strict_min_version": "140.0",
      "data_collection_permissions": {
        "required": ["none"]
      }
    },
    "gecko_android": {
      "strict_min_version": "142.0"
    }
  },
  
  "content_security_policy": "script-src 'self'; object-src 'none'; style-src 'self';",
  
  "icons": {
    "16": "ico/icon-16.png",
    "32": "ico/icon-32.png",
    "48": "ico/icon-48.png",
    "64": "ico/icon-64.png",
    "96": "ico/icon-96.png",
    "128": "ico/icon-128.png"
  },
  
  "permissions": [
    "proxy",
    "storage",
    "activeTab",
    "<all_urls>"
  ],
  
  "browser_action": {
    "default_icon": {
      "16": "ico/icon-16.png",
      "32": "ico/icon-32.png",
      "48": "ico/icon-48.png",
      "64": "ico/icon-64.png",
      "96": "ico/icon-96.png"
    },
    "default_title": "february17th",
    "default_popup": "popup.html"
  },
  
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  }
}
```

---

## Packaging Command

**Correct command for creating Firefox-compatible zip:**
```bash
tar -a -cf february17th-v1.0.1.zip -C firefox .
```

**Important notes:**
- Use `tar` instead of `Compress-Archive` on Windows
- The `-C firefox` changes to the firefox directory
- The `.` includes all files in that directory
- This creates Unix-style paths required by Firefox

---

## Validation Checklist

Before submitting to Firefox Add-ons:

- [ ] All files in zip are referenced/used by the extension
- [ ] Zip file uses Unix-style paths (forward slashes)
- [ ] `browser_specific_settings.gecko.id` is set
- [ ] `browser_specific_settings.gecko.strict_min_version` is set (if using proxy or other restricted permissions)
- [ ] `browser_specific_settings.gecko.data_collection_permissions` is declared
- [ ] Version number is updated in `manifest.json`
- [ ] Version number matches zip filename

---

## Testing

Test the extension locally before submission:
1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from the `firefox/` directory
5. Test all functionality

---

## Resources

- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [Data Collection Consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/)
- [Manifest.json Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [Browser Specific Settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings)

---

**Last Updated:** 2026-03-01  
**Extension Version:** 1.0.1
