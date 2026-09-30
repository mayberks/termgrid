# Security Policy

## Supported versions

| Version | Supported |
|---|:---:|
| 1.0.x | ✅ |
| < 1.0 | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Instead, use [GitHub's private security advisory form](https://github.com/your-username/termgrid/security/advisories/new) or email the maintainers directly.

You should receive an acknowledgement within 72 hours.

## What to expect

1. We will investigate and confirm the issue.
2. We will work on a fix and coordinate a disclosure timeline with you.
3. We will credit you in the release notes (unless you prefer to stay anonymous).

## Scope

TermGrid spawns PTY processes (cmd.exe / PowerShell) on the local machine. The renderer process is sandboxed (`contextIsolation: true`, `nodeIntegration: false`), so renderer-side bugs cannot directly execute code on the host. The main process is the trust boundary.

Security-relevant areas:

- IPC handler validation in `src/main/ipc.js`
- PTY argument sanitization in `src/main/pty-manager.js`
- Renderer message handling in `src/renderer/main.js`

Out of scope:

- Vulnerabilities in upstream dependencies (`electron`, `node-pty`, `xterm.js`) — please report to those projects.