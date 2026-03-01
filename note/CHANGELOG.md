# Changelog

## [1.0.1] - 2026-03-01

### Changed
- Improved status message styling with better spacing and rounded corners
- Consistent input border styling (1px solid #e0e0e0) across popup and settings pages
- Better button alignment throughout the interface
- Always-visible scrollbars in domain lists for improved usability
- Larger header text in settings page (32px) for better readability
- Status messages now appear below input fields for consistent positioning

### Fixed
- "Domain already in list" now correctly shows as error instead of success message
- Button alignment issues in options page resolved
- Scrollbar visibility in domain list sections

### Technical
- Added Firefox built-in data collection consent declaration (no data collected)
- Updated minimum Firefox version to 140.0 (desktop) and 142.0 (Android)
- Improved manifest.json compliance with latest Firefox Add-ons requirements
- Added proper `browser_specific_settings` configuration

---

## [1.0.0] - 2026-02-21

### Added
- Alphabetical sorting for all domain lists
- Status grouping with separate Active and Frozen sections
- Section headers with domain counts
- Real-time synchronization between popup and options pages
- Dated export filenames (YYYY-MM-DD format)
- Tooltips on all action buttons
- Smooth hover animations
- Auto-clear for invalid domain inputs

### Changed
- Improved visual hierarchy with gradient section headers
- Removed borders from domain list containers for cleaner look
- Increased spacing between Active and Frozen sections
- Swapped export/import icons for better intuitive understanding
- Enhanced footer with privacy information
- Ultra-thin scrollbars (4px) with theme color and transparency
- Scrollbar layout stability (no content shift when scrollbar appears)

### Fixed
- Domain list alignment issues
- Export now includes alphabetically sorted domains
- Input field clears after validation errors
- Layout shift when scrollbar appears/disappears

### Security
- Strict domain validation (ASCII only, no IDN)
- Maximum domain limits (5000 total, 5000 per import)
- Content Security Policy enforcement
- No external connections or data collection
- Local storage only

