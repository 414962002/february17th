// Proxy configuration
const PROXY_CONFIG = {
  type: "socks",
  host: "127.0.0.1",
  port: 1080,
  proxyDNS: true
};

// Storage keys
const STORAGE_KEY = "blockedDomains";
const FROZEN_KEY = "frozenDomains";

// Security limits
const MAX_DOMAINS = 5000;
const MAX_IMPORT_SIZE = 5000;

// Load blocked and frozen domains from storage
let blockedDomains = [];
let frozenDomains = [];

/**
 * Validates and normalizes domain names
 * Prevents logic takeover via malformed domains
 * @param {string} domain - Raw domain input
 * @returns {string|null} - Normalized domain or null if invalid
 */
function normalizeDomain(domain) {
  // Type check
  if (!domain || typeof domain !== "string") {
    return null;
  }
  
  // Normalize: trim whitespace, lowercase
  const cleaned = domain.trim().toLowerCase();
  
  // Length checks (DNS limits: max 253 chars total, 63 per label)
  if (cleaned.length === 0 || cleaned.length > 253) {
    return null;
  }
  
  // Strict domain regex
  // Format: subdomain.domain.tld (minimum 2 parts)
  // Allows: a-z, 0-9, hyphens (not at start/end of labels)
  // Requires: at least one dot, valid TLD (2+ chars)
  // Note: This blocks IDN (internationalized domains) for security
  const domainRegex = /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,}$/;
  
  if (!domainRegex.test(cleaned)) {
    return null;
  }
  
  // Additional safety: reject single TLDs (prevents "com" matching all .com sites)
  const parts = cleaned.split('.');
  if (parts.length < 2) {
    return null;
  }
  
  // Reject if any part is empty (catches ".." cases)
  if (parts.some(part => part.length === 0)) {
    return null;
  }
  
  // Validate TLD length (DNS label limit: 63 chars)
  const tld = parts[parts.length - 1];
  if (tld.length > 63) {
    return null;
  }
  
  return cleaned;
}

// Initialize: Load domains from storage
Promise.all([
  browser.storage.local.get(STORAGE_KEY),
  browser.storage.local.get(FROZEN_KEY)
]).then(([blockedResult, frozenResult]) => {
  blockedDomains = blockedResult[STORAGE_KEY] || [];
  frozenDomains = frozenResult[FROZEN_KEY] || [];
  console.log("Loaded blocked domains:", blockedDomains.length);
  console.log("Loaded frozen domains:", frozenDomains.length);
});

// Listen for storage changes (sync across tabs)
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if (changes[STORAGE_KEY]) {
      blockedDomains = changes[STORAGE_KEY].newValue || [];
      console.log("Domains updated:", blockedDomains.length);
    }
    if (changes[FROZEN_KEY]) {
      frozenDomains = changes[FROZEN_KEY].newValue || [];
      console.log("Frozen domains updated:", frozenDomains.length);
    }
  }
});

// Proxy request handler
function handleProxyRequest(requestInfo) {
  let hostname;
  
  // Safe URL parsing - handles special schemes (about:, moz-extension:, etc.)
  try {
    const url = new URL(requestInfo.url);
    hostname = url.hostname;
  } catch (e) {
    // Invalid URL or special scheme
    return { type: "direct" };
  }
  
  // Empty hostname check
  if (!hostname) {
    return { type: "direct" };
  }
  
  // CRITICAL: Normalize hostname
  // - Convert to lowercase for case-insensitive matching
  // - Remove trailing dot (valid DNS format: example.com.)
  hostname = hostname.toLowerCase();
  if (hostname.endsWith('.')) {
    hostname = hostname.slice(0, -1);
  }
  
  // Check if domain or parent domain is blocked
  const isBlocked = blockedDomains.some(domain => {
    return hostname === domain || hostname.endsWith('.' + domain);
  });
  
  if (!isBlocked) {
    return { type: "direct" };
  }
  
  // Check if domain is frozen
  const isFrozen = frozenDomains.some(domain => {
    return hostname === domain || hostname.endsWith('.' + domain);
  });
  
  if (isFrozen) {
    return { type: "direct" };
  }
  
  console.log("Proxying:", hostname);
  return PROXY_CONFIG;
}

// Register proxy handler
browser.proxy.onRequest.addListener(
  handleProxyRequest,
  { urls: ["<all_urls>"] }
);

// Message handler for popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Defensive: Verify message comes from this extension
  // (Firefox blocks external messages by default, but this adds extra safety)
  if (sender.id && sender.id !== browser.runtime.id) {
    console.warn("Rejected message from external source:", sender.id);
    return;
  }
  
  if (message.action === "getDomains") {
    sendResponse({ 
      domains: blockedDomains,
      frozenDomains: frozenDomains
    });
  }
  
  if (message.action === "addDomain") {
    const domain = normalizeDomain(message.domain);
    
    if (!domain) {
      sendResponse({ success: false, error: "Invalid domain format (e.g., example.com)" });
      return;
    }
    
    // Check if already exists
    if (blockedDomains.includes(domain)) {
      sendResponse({ success: true, message: "Domain already in list" });
      return;
    }
    
    // Check domain limit
    if (blockedDomains.length >= MAX_DOMAINS) {
      sendResponse({ 
        success: false, 
        error: `Maximum ${MAX_DOMAINS} domains reached` 
      });
      return;
    }
    
    // Add domain
    blockedDomains.push(domain);
    
    // Save to storage
    browser.storage.local.set({ [STORAGE_KEY]: blockedDomains }).then(() => {
      console.log("Added domain:", domain);
      sendResponse({ success: true, message: "Domain added successfully" });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Async response
  }
  
  if (message.action === "removeDomain") {
    const domain = normalizeDomain(message.domain);
    
    if (!domain) {
      sendResponse({ success: false, error: "Invalid domain" });
      return;
    }
    
    // Remove domain from both lists
    blockedDomains = blockedDomains.filter(d => d !== domain);
    frozenDomains = frozenDomains.filter(d => d !== domain);
    
    // Save to storage
    Promise.all([
      browser.storage.local.set({ [STORAGE_KEY]: blockedDomains }),
      browser.storage.local.set({ [FROZEN_KEY]: frozenDomains })
    ]).then(() => {
      console.log("Removed domain:", domain);
      sendResponse({ success: true, message: "Domain removed successfully" });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Async response
  }
  
  if (message.action === "toggleFreeze") {
    const domain = normalizeDomain(message.domain);
    
    if (!domain) {
      sendResponse({ success: false, error: "Invalid domain" });
      return;
    }
    
    if (frozenDomains.includes(domain)) {
      // Unfreeze
      frozenDomains = frozenDomains.filter(d => d !== domain);
    } else {
      // Freeze
      frozenDomains.push(domain);
    }
    
    // Save to storage
    browser.storage.local.set({ [FROZEN_KEY]: frozenDomains }).then(() => {
      console.log("Toggled freeze for:", domain);
      sendResponse({ success: true, message: "Toggled successfully" });
    }).catch(err => {
      console.error("Error toggling freeze:", err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Async response
  }
  
  if (message.action === "importDomains") {
    const rawDomains = message.domains || [];
    
    // Size limit check (DoS prevention)
    if (!Array.isArray(rawDomains) || rawDomains.length > MAX_IMPORT_SIZE) {
      sendResponse({ 
        success: false, 
        error: `Too many domains (max ${MAX_IMPORT_SIZE})` 
      });
      return;
    }
    
    let added = 0;
    let skipped = 0;
    let invalid = 0;
    
    rawDomains.forEach(rawDomain => {
      const domain = normalizeDomain(rawDomain);
      
      if (!domain) {
        invalid++;
        return;
      }
      
      // Check total limit
      if (blockedDomains.length >= MAX_DOMAINS) {
        skipped++;
        return;
      }
      
      if (!blockedDomains.includes(domain)) {
        blockedDomains.push(domain);
        added++;
      } else {
        skipped++;
      }
    });
    
    // Save to storage
    browser.storage.local.set({ [STORAGE_KEY]: blockedDomains }).then(() => {
      console.log(`Import: ${added} added, ${skipped} duplicates, ${invalid} invalid`);
      sendResponse({ 
        success: true, 
        added: added,
        skipped: skipped,
        invalid: invalid,
        message: `Imported ${added} domains (${invalid} invalid, ${skipped} skipped)`
      });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Async response
  }
});

console.log("february17th v1.0.0: Background script loaded");
console.log("Security: Domain validation enabled");
console.log("Security: Message sender verification enabled");
console.log("Security: Import limits enabled (max " + MAX_IMPORT_SIZE + " per import, " + MAX_DOMAINS + " total)");

