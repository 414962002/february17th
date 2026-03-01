# Mozilla AMO Review Notes
## february17th Extension

**Version:** 1.0.0  

---

## For Mozilla Reviewers

This document explains the extension's architecture, permissions, and security measures to facilitate the review process.

---

## Extension Purpose

february17th is a domain-based proxy manager that routes user-specified websites through a local SOCKS5 proxy server.

**Use Cases:**
- Accessing region-restricted content
- Privacy-conscious browsing
- Development and testing
- Circumventing network restrictions

---

## Permissions Justification

### 1. `proxy` Permission (High Privilege)

**Why Needed:** Core functionality - intercept web requests and route specific domains through local proxy

**How Used:**
```javascript
// background.js lines 130-135
browser.proxy.onRequest.addListener(
  handleProxyRequest,
  { urls: ["<all_urls>"] }
);
```

**What It Does:**
- Intercepts ALL web requests (required by Firefox proxy API)
- Checks if request's domain is in user's blocked list
- Routes to local proxy (127.0.0.1:1080) if matched
- Allows direct connection if not matched

**Security Measures:**
- Proxy config is **hardcoded** (lines 3-7):
  ```javascript
  const PROXY_CONFIG = {
    type: "socks",
    host: "127.0.0.1",  // Local only
    port: 1080,
    proxyDNS: true
  };
  ```
- No dynamic proxy configuration
- No remote proxy servers
- Only routes domains explicitly added by user
- Cannot be manipulated by web pages

**Why Safe:**
- User has full control over which domains are proxied
- Proxy server is user's own local server
- No data sent to external servers
- No modification of web content

---

### 2. `<all_urls>` Permission (High Privilege)

**Why Needed:** Required by Firefox proxy API to intercept requests

**How Used:**
- Only reads `hostname` from request URL
- Does NOT access page content
- Does NOT modify requests
- Does NOT inject scripts

**Code Evidence:**
```javascript
// background.js lines 105-125
function handleProxyRequest(requestInfo) {
  let hostname;
  try {
    const url = new URL(requestInfo.url);
    hostname = url.hostname;  // Only reads hostname
  } catch (e) {
    return { type: "direct" };
  }
  
  // ... domain matching logic ...
  
  return PROXY_CONFIG;  // or { type: "direct" }
}
```

**What Extension Does NOT Do:**
- ❌ No content scripts
- ❌ No page modification
- ❌ No data extraction
- ❌ No tracking
- ❌ No analytics

---

### 3. `storage` Permission

**Why Needed:** Persist user's domain list

**How Used:**
```javascript
// Stores two arrays:
// 1. blockedDomains - domains to proxy
// 2. frozenDomains - temporarily disabled domains
browser.storage.local.set({ blockedDomains: [...] });
```

**Data Stored:**
- Domain names only (e.g., "example.com")
- No URLs, no browsing history
- No sensitive data

---

### 4. `activeTab` Permission

**Why Needed:** Auto-fill current domain in popup (UX feature)

**How Used:**
```javascript
// popup.js lines 4-20
browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  const url = new URL(tabs[0].url);
  currentDomain = url.hostname;  // Auto-fill for convenience
});
```

**User Benefit:** One-click add current site to proxy list

---

## Security Measures Implemented

### 1. Strict Input Validation
**File:** background.js, function `normalizeDomain()` (lines 26-70)

**Validates:**
- Type checking (string only)
- Length limits (253 chars total, 63 per label)
- Strict regex: `/^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/`
- Rejects single TLDs (prevents "com" matching all .com sites)
- Rejects malformed domains

**Prevents:**
- Logic takeover attacks
- ReDoS (Regular Expression Denial of Service)
- Injection attempts

---

### 2. DoS Protection
**Limits:**
- Max 5000 domains total
- Max 5000 domains per import
- Each domain validated individually

**Code:**
```javascript
const MAX_DOMAINS = 5000;
const MAX_IMPORT_SIZE = 5000;
```

---

### 3. Content Security Policy
**Manifest.json:**
```json
"content_security_policy": "script-src 'self'; object-src 'none'; style-src 'self';"
```

**Prevents:**
- Inline script execution
- External script loading
- Plugin/object injection

---

### 4. No External Dependencies
- ❌ No remote scripts
- ❌ No external CSS (Google Fonts removed)
- ❌ No analytics
- ❌ No tracking
- ✅ All resources local

---

### 5. Privacy by Design
- No data collection
- No external network requests
- No telemetry
- No user tracking
- Domain list never leaves user's device

---

## Architecture Overview

### Components
1. **background.js** - Proxy routing logic
2. **popup.html/js** - Quick-add interface
3. **options.html/js** - Full domain management
4. **popup.css/options.css** - Styling (external, no inline)

### Data Flow
```
User adds domain → Validation → Storage → Proxy handler checks → Route decision
```

### No Content Scripts
- Extension does NOT inject code into web pages
- Extension does NOT access page content
- Extension does NOT modify web pages

---

## Testing Performed

### Security Tests
- ✅ Domain validation edge cases
- ✅ ReDoS testing (10k+ character strings)
- ✅ Import size limits
- ✅ XSS prevention
- ✅ CSP enforcement

### Functionality Tests
- ✅ Add/remove domains
- ✅ Freeze/unfreeze domains
- ✅ Export/import domain lists
- ✅ Proxy routing accuracy

---

## Code Quality

### No Obfuscation
- All code is readable
- No minification
- No bundlers
- Plain JavaScript

### No External Libraries
- No npm dependencies
- No third-party code
- Pure browser APIs

### Documentation
- Comprehensive README
- Security documentation (SECURITY.md)
- Threat model (THREAT_MODEL.md)
- Testing guide (TESTING.md)

---

## Common Review Questions

### Q: Why do you need `<all_urls>`?
**A:** Required by Firefox proxy API. We only read hostname, not page content.

### Q: Why local proxy only?
**A:** Security and privacy. User controls their own proxy server. No data sent to external servers.

### Q: Can this be used maliciously?
**A:** No. User explicitly adds domains. Extension cannot be controlled by web pages. No remote configuration.

### Q: What data do you collect?
**A:** None. Zero data collection. No analytics, no tracking, no telemetry.

### Q: Why not use webRequest API instead?
**A:** Proxy API is more appropriate for routing decisions. webRequest would require more permissions and complexity.

---

## Comparison to Similar Extensions

### What Makes This Different:
1. **Local proxy only** - No remote servers
2. **User control** - Explicit domain list
3. **No tracking** - Zero data collection
4. **Open source** - All code visible
5. **Minimal permissions** - Only 4 permissions

---

## Source Code Verification

### Key Files to Review:
1. **background.js** - Proxy logic (main security concern)
2. **manifest.json** - Permissions and CSP
3. **popup.js** - User interface logic
4. **options.js** - Domain management

### Security-Critical Functions:
- `normalizeDomain()` - Input validation (background.js:26-70)
- `handleProxyRequest()` - Proxy routing (background.js:105-135)
- Message handlers - User actions (background.js:145-280)

---

## Post-Review Updates

If any issues found during review:
1. Will address immediately
2. Will provide detailed explanation
3. Will update documentation
4. Will resubmit promptly

---

## Contact Information

**Developer:** [Your name]  
**Email:** [Your email]  
**Support:** [Support channel]  
**Source Code:** [GitHub URL if applicable]

---

## Additional Documentation

Available in extension package:
- `README.md` - User guide
- `SECURITY.md` - Security overview
- `THREAT_MODEL.md` - Threat analysis
- `PERMISSIONS.md` - Permission justification
- `TESTING.md` - Test suite
- `CHANGELOG.md` - Version history

---

## Reviewer Checklist

For your convenience:

- [ ] Verify proxy config is hardcoded (background.js:3-7)
- [ ] Verify no remote servers
- [ ] Verify input validation (background.js:26-70)
- [ ] Verify no content scripts in manifest
- [ ] Verify CSP is strict
- [ ] Verify no external requests
- [ ] Verify no data collection
- [ ] Test domain add/remove functionality
- [ ] Test proxy routing works correctly

---

**Thank you for reviewing february17th!**

We've put significant effort into security, privacy, and code quality. Please let us know if you have any questions or concerns.

---

**Prepared:** February 20, 2026  
**For:** Mozilla Add-ons Review Team  
**Extension:** february17th v1.0.0

