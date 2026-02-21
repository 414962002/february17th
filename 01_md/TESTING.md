# Testing Guide - february17th v1.0.0

## Quick Security Test Suite

### Prerequisites
1. Load extension in Firefox: `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json`
4. Open Browser Console (Ctrl+Shift+J) to see security logs

---

## Security Tests

### Test 1: Domain Validation - Single TLD (CRITICAL)
**Purpose:** Prevent logic takeover where "com" matches all .com sites

**Steps:**
1. Click extension icon
2. Type `com` in domain field
3. Click add button

**Expected Result:**
- ❌ Error: "Invalid domain format (e.g., example.com)"
- Domain NOT added to list

**Why This Matters:** Without this fix, adding "com" would proxy the entire internet

---

### Test 2: Empty Domain
**Steps:**
1. Clear domain field (empty string)
2. Click add button

**Expected Result:**
- ❌ Error: "Invalid domain format (e.g., example.com)"

---

### Test 3: Malformed Domain
**Steps:**
1. Type `example..com` (double dot)
2. Click add button

**Expected Result:**
- ❌ Error: "Invalid domain format (e.g., example.com)"

---

### Test 4: Protocol Inclusion
**Steps:**
1. Type `http://evil.com`
2. Click add button

**Expected Result:**
- ❌ Error: "Invalid domain format (e.g., example.com)"

---

### Test 5: HTML/Script Injection
**Steps:**
1. Type `<script>alert(1)</script>`
2. Click add button

**Expected Result:**
- ❌ Error: "Invalid domain format (e.g., example.com)"

---

### Test 6: Valid Domain
**Steps:**
1. Type `example.com`
2. Click add button

**Expected Result:**
- ✅ Success: "Domain added successfully"
- Domain appears in list

---

### Test 7: Domain Normalization
**Steps:**
1. Type `  Example.COM  ` (spaces, uppercase)
2. Click add button

**Expected Result:**
- ✅ Success: "Domain added successfully"
- Domain appears as `example.com` (lowercase, trimmed)

---

### Test 8: Duplicate Detection
**Steps:**
1. Add `example.com`
2. Try adding `example.com` again

**Expected Result:**
- ✅ Success: "Domain already in list"
- No duplicate created

---

### Test 9: Import Size Limit
**Steps:**
1. Open options page (click settings icon)
2. Create a text file with 10,000 lines (any text)
3. Click import button
4. Select the file

**Expected Result:**
- ❌ Error: "Too many domains (max 5000)"
- No domains imported

---

### Test 10: Import with Invalid Domains
**Steps:**
1. Create file with mixed content:
```
example.com
google.com
com
invalid
test.co.uk
http://bad.com
```
2. Import the file

**Expected Result:**
- ✅ Success message showing:
  - 3 added (example.com, google.com, test.co.uk)
  - 3 invalid (com, invalid, http://bad.com)

---

### Test 11: Special URL Handling
**Steps:**
1. With extension loaded, visit:
   - `about:config`
   - `about:debugging`

**Expected Result:**
- No errors in console
- Extension doesn't crash
- Pages load normally

---

### Test 12: Trailing Dot Hostname
**Steps:**
1. Add `example.com` to proxy list
2. In console, test: `new URL("http://example.com./test").hostname`
3. Visit a site that might use trailing dot

**Expected Result:**
- Hostname normalized (trailing dot removed)
- Domain matches correctly

---

## Functionality Tests

### Test 13: Freeze/Unfreeze
**Steps:**
1. Add `example.com`
2. Click freeze button (pause icon)
3. Check statistics

**Expected Result:**
- Domain shows as frozen (grayed out)
- Active count decreases
- Frozen count increases

---

### Test 14: Export Domains
**Steps:**
1. Add several domains
2. Open options page
3. Click export button

**Expected Result:**
- File downloads: `february17th-domains.txt`
- Contains all domains (one per line)

---

### Test 15: Remove Domain
**Steps:**
1. Add `test.com`
2. Open options page
3. Click remove button (X) next to domain
4. Confirm deletion

**Expected Result:**
- Domain removed from list
- Statistics update

---

## Console Verification

### Expected Console Output on Load
```
february17th v1.0.0: Background script loaded
Security: Domain validation enabled
Security: Message sender verification enabled
Security: Import limits enabled (max 5000 per import, 5000 total)
Loaded blocked domains: 0
Loaded frozen domains: 0
```

### Expected Console Output on Add
```
Added domain: example.com
```

### Expected Console Output on Import
```
Import: 3 added, 2 duplicates, 1 invalid
```

---

## UI Tests

### Test 16: Popup Display
**Steps:**
1. Click extension icon

**Expected Result:**
- Popup opens smoothly
- System fonts render correctly (no Inter font)
- Statistics display correctly
- Current domain auto-fills

---

### Test 17: Options Page
**Steps:**
1. Click settings icon in popup
2. Or right-click extension → Manage Extension → Options

**Expected Result:**
- Options page opens in new tab
- System fonts render correctly
- Search box works
- All buttons functional

---

## Performance Tests

### Test 18: Large Domain List
**Steps:**
1. Import 1000 valid domains
2. Check popup load time
3. Check options page load time

**Expected Result:**
- Popup opens in < 1 second
- Options page loads smoothly
- No UI freezing

---

### Test 19: Proxy Performance
**Steps:**
1. Add 100 domains
2. Browse various websites
3. Monitor console for proxy decisions

**Expected Result:**
- No noticeable slowdown
- Proxy decisions logged correctly
- Direct connections for non-proxied sites

---

## Security Verification

### Test 20: No External Requests
**Steps:**
1. Open Network tab in DevTools
2. Open popup
3. Open options page

**Expected Result:**
- ❌ No requests to fonts.googleapis.com
- ❌ No requests to fonts.gstatic.com
- ✅ Only local resources loaded

---

### Test 21: CSP Enforcement
**Steps:**
1. Check manifest.json
2. Verify CSP is present

**Expected Result:**
```json
"content_security_policy": "script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline';"
```

---

## Regression Tests

### Test 22: Existing Domains Still Work
**Steps:**
1. If you had domains from v1.0.0, verify they still work
2. Check frozen domains are still frozen

**Expected Result:**
- All existing domains preserved
- Frozen state maintained
- No data loss

---

## Edge Cases

### Test 23: Maximum Domain Length
**Steps:**
1. Try adding a 254-character domain

**Expected Result:**
- ❌ Error: "Invalid domain format"
- (Max is 253 chars per DNS spec)

---

### Test 24: Subdomain Matching
**Steps:**
1. Add `example.com`
2. Visit `sub.example.com`

**Expected Result:**
- ✅ Subdomain should be proxied
- Console: "Proxying: sub.example.com"

---

### Test 25: Similar Domain Names
**Steps:**
1. Add `example.com`
2. Visit `notexample.com`

**Expected Result:**
- ❌ Should NOT be proxied
- Direct connection

---

## Sorting & Organization Tests

### Test 26: Alphabetical Sorting
**Steps:**
1. Add domains in random order: `zebra.com`, `apple.com`, `microsoft.com`
2. Check both popup and options page

**Expected Result:**
- Domains appear alphabetically: apple.com, microsoft.com, zebra.com
- Order maintained in both active and frozen sections

---

### Test 27: Status Grouping
**Steps:**
1. Add 5 domains
2. Freeze 2 domains
3. Check sections

**Expected Result:**
- Active section shows 3 domains (alphabetical)
- Frozen section shows 2 domains (alphabetical)
- Section headers show correct counts

---

### Test 28: Real-time Sync
**Steps:**
1. Open options page
2. Open popup in separate window
3. Add domain from popup
4. Check options page (don't refresh)

**Expected Result:**
- Domain appears in options page immediately
- No manual refresh needed
- Alphabetical order maintained

---

### Test 29: Freeze Sync
**Steps:**
1. Open options page and popup side by side
2. Freeze domain from popup
3. Check options page

**Expected Result:**
- Domain moves to frozen section in options page immediately
- Counts update in both windows
- Alphabetical order maintained in both sections

---

### Test 30: Export with Date
**Steps:**
1. Click export button
2. Check filename

**Expected Result:**
- Filename format: `february17th-domains-YYYY-MM-DD.txt`
- Date matches current date
- File content is alphabetically sorted

---

## Pass/Fail Criteria

### Critical Tests (Must Pass)
- ✅ Test 1: Single TLD rejection
- ✅ Test 6: Valid domain acceptance
- ✅ Test 7: Domain normalization
- ✅ Test 9: Import size limit
- ✅ Test 11: Special URL handling
- ✅ Test 20: No external requests

### Important Tests (Should Pass)
- All other tests

### Known Limitations
- IDN domains (e.g., `аррӏе.com`) will be rejected - this is by design for security

---

## Automated Testing (Future)

For future releases, consider:
- Unit tests for `normalizeDomain()`
- Integration tests for message handlers
- Performance benchmarks
- Automated security scanning

---

## Reporting Issues

If any test fails:
1. Note the test number and description
2. Copy console output
3. Note Firefox version
4. Report in issue tracker

---

**Testing Checklist:**
- [ ] All security tests passed
- [ ] All functionality tests passed
- [ ] Console output verified
- [ ] No JavaScript errors
- [ ] UI renders correctly
- [ ] Performance acceptable

**Status:** Ready for production use when all tests pass
