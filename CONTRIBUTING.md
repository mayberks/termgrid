# Contributing

Thanks for your interest in TermGrid.

## Quick start

```bash
git clone https://github.com/mayberks/termgrid.git
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

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
feat: drag-and-drop folder onto window spawns new terminal
fix: PTY exit code not displayed in cell header
docs: add architecture diagram to README
refactor: split renderer into grid.js and terminal.js
chore: bump electron to 33.4.11
```

A scope is optional but encouraged when it improves clarity.

## Pull request process

1. Fork, branch, commit, push, then open a PR against `main`.
2. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
3. Confirm `npm start` works on Windows 10/11.
4. If the change is user-visible, add an entry to `CHANGELOG.md` under `[Unreleased]`.

## Architectural rules

These rules keep the codebase reviewable as it grows:

- **Main process** is CommonJS. One responsibility per file in `src/main/`.
- **Preload** is the only renderer ↔ main bridge. Anything the renderer needs must be exposed on `window.api` via `contextBridge`.
- **Renderer** is plain browser JS. No `require()`, no Node APIs.
- **IPC contract** is centralized: handlers in `src/main/ipc.js`, exposed methods in `src/preload/preload.js`. Keep both in sync.
- **`'use strict'`** at the top of every file.
- **JSDoc** on every public function in `src/main/`.

## Testing

Manual testing on Windows is the baseline. Automated tests are welcome — add them under `tests/` and wire a script in `package.json`.

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Open DevTools with `Ctrl+Shift+I` and include console output if relevant.

## Suggesting features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
