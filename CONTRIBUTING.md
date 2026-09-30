# Contributing to TermGrid

Thanks for your interest in making TermGrid better! 🎉

## Code of conduct

Be kind, be constructive. Assume good faith.

## Quick start

```bash
git clone https://github.com/your-username/termgrid.git
cd termgrid
npm install
npm start
```

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, always-green |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation only |
| `refactor/<name>` | No behavior change |

Base your PR on `main`, not on stale branches.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: drag-and-drop folder onto window spawns new terminal
fix: PTY exit code not displayed in cell header
docs: add architecture diagram to README
refactor: split renderer into grid.js and terminal.js
chore: bump electron to 33.4.11
```

Scope is optional but encouraged when it improves clarity.

## Pull request process

1. Fork → branch → commit → push → open a PR against `main`.
2. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
3. Make sure `npm start` works on Windows 10/11.
4. If your change is user-visible, mention it in `CHANGELOG.md` under `[Unreleased]`.

## Architectural rules

These rules keep the codebase reviewable as it grows:

- **Main process** is CommonJS. One responsibility per file in `src/main/`.
- **Preload** is the only renderer ↔ main bridge. Anything the renderer needs must be exposed on `window.api` via `contextBridge`.
- **Renderer** is plain browser JS. No `require()`. No Node APIs.
- **IPC contract** is centralized: handlers in `src/main/ipc.js`, exposed methods in `src/preload/preload.js`. Keep both in sync.
- **`'use strict'`** at the top of every file.
- **JSDoc** on every public function in `src/main/`.

## Testing

Manual testing on Windows is currently the norm. Automated tests are welcome — add them under `tests/` and wire a script in `package.json`.

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Open DevTools with `Ctrl+Shift+I` and include console output if relevant.

## Suggesting features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).