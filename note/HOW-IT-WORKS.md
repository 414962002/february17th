# february17th - Technical Documentation

## Overview

february17th is a Firefox extension that routes specific domains through a local SOCKS5 proxy (127.0.0.1:1080). It provides a simple interface to manage which domains should be proxied.

## Architecture

### Files Structure
```
february17th/
├── manifest.json       # Extension configuration
├── background.js       # Proxy routing logic
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic
├── popup.css           # Popup styling
├── options.html        # Settings page
├── options.js          # Settings logic
├── options.css         # Settings styling
├── ico/                # Extension icons (16-128px)
├── README.md           # User documentation
├── SECURITY.md         # Security & privacy details
├── HOW-IT-WORKS.md     # Technical documentation
└── TESTING.md          # Testing guide
```

## Core Functionality

### Proxy Routing

The extension intercepts all web requests and decides whether to route them through the SOCKS5 proxy or allow direct connection.

**Decision Logic:**
```
Request → Extract domain → Check if in list
  → Not in list: Direct connection
  → In list: Check if frozen
    → Frozen: Direct connection
    → Active: Route through SOCKS5 proxy
```

### Domain Management

- **Add domains**: Manually or from current tab
- **Freeze domains**: Temporarily disable proxy without removing
- **Remove domains**: Delete from list (settings page only)
- **Export/Import**: Backup and restore domain lists (settings page only)  

### Data Storage

All data is stored locally in browser storage:
- `blockedDomains`: Array of domain strings
- `frozenDomains`: Array of frozen domain strings

Changes sync automatically across all tabs.

### Real-time Synchronization

The extension uses `browser.storage.onChanged` listener to detect when domains are modified from any window (popup, options, or other tabs). When a change is detected, the options page automatically reloads and re-renders the domain lists, ensuring all windows stay synchronized without manual refresh.

### Domain Organization

Domains are automatically organized for better usability:
- **Alphabetical sorting**: All domains sorted A→Z using `localeCompare()`
- **Status grouping**: Active and frozen domains displayed in separate sections
- **Section headers**: Visual separation with gradient backgrounds and domain counts
- **Consistent ordering**: Sorting applied in popup, options page, and export files

## User Interface

### Popup Window

- **Header**: Extension name, statistics (total/active/frozen), menu button
- **Domain Input**: Editable field showing current tab's domain
- **Add Button**: Add domain to proxy list
- **Domain List**: Shows all domains with freeze toggle buttons

### Settings Page

- **Header**: Extension name, statistics, export/import buttons
- **Add Domain**: Manual domain input
- **Search**: Filter domain list
- **Domain List**: Full list with freeze and delete buttons

## Proxy Configuration

Default configuration (hardcoded):
```javascript
{
  type: "socks",
  host: "127.0.0.1",
  port: 1080,
  proxyDNS: true
}
```

To modify: Edit `PROXY_CONFIG` constant in `background.js`

## Design System

### Typography
- Font: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif)
- Title: 28px (popup), 18px (settings)
- Statistics: 10px, uppercase
- Domains: 13-15px, lowercase

### Colors
- Header gradient: #a8edea → #fed6e3
- Accent: #95d5d2
- Primary text: #2c3e50
- Secondary text: #7f8c8d
- Buttons: #E9EEF0 background, #6F7C82 text
- Active domain: #16a085

### Layout
- Container border: 3px solid #95d5d2
- Inner padding: 4px white space
- Border radius: 8px (containers), 6px (buttons)
- All buttons: 28×28px, aligned vertically

### Icons
- Style: Minimalist SVG, stroke-width 1.5
- Pause (freeze): || 
- Remove: ×
- Add: +
- Menu: ≡
- Export: ↓
- Import: ↑

## Technical Details

### Browser API Usage

- `browser.proxy.onRequest`: Intercept and route requests
- `browser.storage.local`: Store domain lists
- `browser.tabs.query`: Get current tab domain
- `browser.runtime.sendMessage`: Communication between components

### Message Passing

Components communicate via message passing:
```javascript
// From popup/options to background
browser.runtime.sendMessage({
  action: "addDomain",
  domain: "example.com"
});

// Background processes and updates storage
// All tabs receive storage.onChanged event
```

### Requirements

- Firefox 57 or higher
- Local SOCKS5 proxy running on 127.0.0.1:1080
- Permissions: proxy, storage, activeTab, <all_urls>

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and how to contribute to the project.
