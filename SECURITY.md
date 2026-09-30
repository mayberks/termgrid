# Security Policy

## Supported versions

| Version | Supported |
|---|:---:|
| 1.0.x | Yes |
| < 1.0 | No |

## Reporting a vulnerability

Do not open a public issue. Use [GitHub's private security advisory form](https://github.com/mayberks/termgrid/security/advisories/new) or email the maintainers directly. You should receive an acknowledgement within 72 hours.

## Disclosure process

1. We confirm the report and investigate.
2. We develop a fix and agree on a disclosure timeline with you.
3. We credit you in the release notes unless you prefer to stay anonymous.

## Scope

TermGrid spawns PTY processes (`cmd.exe` / PowerShell) on the local machine. The renderer runs sandboxed (`contextIsolation: true`, `nodeIntegration: false`); renderer-side bugs cannot directly execute host code. The main process is the trust boundary.

Security-relevant areas:

- IPC handler validation in `src/main/ipc.js`
- PTY argument handling in `src/main/pty-manager.js`
- Renderer message handling in `src/renderer/main.js`

Out of scope: vulnerabilities in upstream dependencies (`electron`, `node-pty`, `xterm.js`) — report those to the respective projects.
