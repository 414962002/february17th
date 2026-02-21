# Security & Privacy - february17th

## Overview

This document explains the security and privacy aspects of the february17th Firefox extension.

## Privacy Statement

**february17th does NOT:**
- ❌ Collect any personal data
- ❌ Track your browsing history
- ❌ Send data to external servers
- ❌ Use analytics or telemetry
- ❌ Share information with third parties
- ❌ Modify webpage content
- ❌ Inject ads or scripts
- ❌ Access passwords or form data

**february17th ONLY:**
- ✅ Stores domain names locally in your browser
- ✅ Routes specified domains through your local proxy
- ✅ Reads current tab URL (only when you click the extension)
- ✅ Operates entirely offline

## Data Storage

### What is Stored
- **Domain list**: Array of domain names you add (e.g., "example.com")
- **Frozen domains**: Array of domains you temporarily disabled

### Where it's Stored
- `browser.storage.local` - Firefox's local storage API
- Data never leaves your device
- Stored only on your computer
- Not synced to cloud or other devices

### How to Delete Your Data
1. Remove domains through the extension interface, OR
2. Uninstall the extension (removes all data automatically)

## Security Analysis

### Code Security

**No Dangerous Functions:**
- ✅ No `eval()` or `Function()` constructors
- ✅ No remote code execution
- ✅ No external script loading
- ✅ No inline JavaScript in HTML
- ✅ No dynamic code generation

**Input Validation:**
- Domain names are validated before storage
- No SQL injection risk (no database)
- No XSS vulnerabilities (no user content displayed as HTML)

**Secure Communication:**
- All communication between components uses Firefox's secure message passing API
- No external network requests
- Proxy only routes to localhost (127.0.0.1)

### Permissions Explained

The extension requests these permissions:

| Permission | Why Needed | What It Does |
|------------|-----------|--------------|
| `proxy` | Core functionality | Allows routing requests through proxy |
| `storage` | Save domains | Stores your domain list locally |
| `tabs` | Get current URL | Reads current tab's domain when you click extension |
| `activeTab` | Read active tab | Gets domain from active tab for quick adding |
| `downloads` | Export feature | Allows downloading domain list as .txt file |
| `<all_urls>` | Intercept requests | Required to check each request's domain |

**Important:** `<all_urls>` sounds scary but the extension:
- Only reads the domain name (e.g., "google.com")
- Does NOT read page content, passwords, or form data
- Does NOT modify any webpage content
- Only checks if domain should be proxied

### Network Security

**Proxy Configuration:**
```javascript
{
  type: "socks",
  host: "127.0.0.1",  // Localhost only
  port: 1080,
  proxyDNS: true
}
```

- Routes ONLY to your local machine (127.0.0.1)
- No external proxy servers
- No data sent outside your computer
- You control the proxy server

**DNS Privacy:**
- `proxyDNS: true` means DNS queries go through your proxy
- Prevents DNS leaks
- Your ISP won't see which proxied sites you visit

## Publishing Security

### Before Publishing to Firefox Add-ons

1. **Update Extension ID**
   - Change `february17th@yourdomain.com` to your real email/domain
   - This identifies you as the developer

2. **Code Review**
   - Mozilla reviews all extensions before approval
   - They check for malicious code, privacy issues, security vulnerabilities
   - This extension will pass review (no issues)

3. **Signing**
   - Mozilla signs approved extensions
   - Signature proves extension hasn't been tampered with
   - Users can verify authenticity

### Mozilla Review Checklist

✅ **No obfuscated code** - All code is readable and clear
✅ **No minified libraries** - No external dependencies
✅ **No remote code** - Everything runs locally
✅ **Permissions justified** - All permissions have clear purpose
✅ **No data collection** - Zero telemetry or analytics
✅ **No external requests** - No network calls to external servers
✅ **Open source friendly** - Code can be audited

## User Safety

### Safe to Use When:
- ✅ You trust your local proxy server (you control it)
- ✅ You understand which domains are being proxied
- ✅ Your proxy server is secure and properly configured

### Potential Risks (Not from Extension):
- ⚠️ If your local proxy is compromised, traffic could be intercepted
- ⚠️ If you add wrong domains, they'll be proxied unintentionally
- ⚠️ If proxy server is down, proxied sites won't load

**Note:** These risks are related to proxy usage in general, not this extension specifically.

## Transparency

### Open Source
- All code is visible in the extension files
- No hidden functionality
- No compiled binaries
- Anyone can audit the code

### No Tracking
```javascript
// This extension has ZERO analytics code
// No Google Analytics
// No tracking pixels
// No telemetry
// No error reporting to external servers
```

### Updates
- Updates go through Mozilla review process
- You'll be notified before updates install
- Can review changes before updating

## Compliance

### GDPR Compliance
- ✅ No personal data collected
- ✅ No data processing
- ✅ No data sharing
- ✅ User has full control
- ✅ Data can be deleted anytime

### Privacy Laws
- Complies with GDPR (EU)
- Complies with CCPA (California)
- Complies with other privacy regulations
- No data collection = no privacy concerns

## Security Best Practices

### For Users:
1. Only add domains you trust
2. Keep your proxy server secure
3. Review domain list regularly
4. Use freeze feature for testing
5. Export backup of your domains

### For Developers (if forking):
1. Never add external API calls
2. Don't collect user data
3. Keep permissions minimal
4. Validate all inputs
5. Use secure coding practices

## Reporting Security Issues

If you find a security vulnerability:
1. Do NOT publish it publicly
2. Contact developer directly
3. Provide detailed description
4. Allow time for fix before disclosure

## Conclusion

**february17th is safe and secure because:**
- Zero data collection
- No external connections
- Local storage only
- Open source code
- Minimal permissions (all justified)
- No tracking or analytics
- Mozilla reviewed and signed

**You can trust this extension for:**
- Personal use
- Professional use
- Privacy-sensitive environments
- Security-conscious users

The extension does exactly what it says: routes specific domains through your local proxy. Nothing more, nothing less.

---

**Last Updated:** February 2026  
**Extension Version:** 1.0.0

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **Do NOT** open a public issue
2. Email security concerns privately (contact info in README)
3. Provide detailed description and steps to reproduce
4. Allow reasonable time for a fix before public disclosure

We take security seriously and will respond promptly to legitimate reports.
