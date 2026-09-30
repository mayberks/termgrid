# Changelog

All notable changes to TermGrid will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-30

### Added
- Grid layout that auto-arranges 1–N terminal cells
- Floating action button (bottom-right) for adding new terminals
- `Ctrl+G` keyboard shortcut to open the folder picker
- Dark theme with native Windows dark title bar
- Modular codebase: main / preload / renderer split
- `PtyManager` class encapsulating PTY lifecycle
- Build pipeline producing portable `.exe`
- Auto-generated icons (SVG → PNG → ICO)
- Themed scrollbars matching the dark palette

### Security
- `contextIsolation: true`
- `nodeIntegration: false`
- Sandboxed renderer, IPC-mediated API only

[Unreleased]: https://github.com/your-username/termgrid/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/termgrid/releases/tag/v1.0.0