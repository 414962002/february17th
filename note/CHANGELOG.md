# Changelog

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
