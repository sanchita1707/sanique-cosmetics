# Sanique Cosmetics Performance & Testing Rules

The following rules apply to all future UI/design changes in the Sanique Cosmetics project to prevent system performance issues (such as laptop slowdowns or hangs):

## Browser and Server Constraints
- **Do NOT automatically open the website in a browser** after making changes.
- **Do NOT launch Chrome, Edge, or any browser automatically**.
- **Do NOT repeatedly refresh the website**.
- **Do NOT perform automatic visual/browser testing**.
- **Do NOT keep the local server running** after validation.
- **Do NOT use browser automation** or open multiple browser tabs.
- **Do NOT run multiple servers simultaneously**.
- **Do NOT use heavy automated testing tools** (e.g. Playwright, Puppeteer).
- **Do NOT generate unnecessary screenshots** or browser previews.
- **Do NOT repeatedly inspect the same files** unless necessary.

## Command and Process Management
- **Do NOT run npm install, npm audit, npm build, or other heavy commands** unless strictly required.
- **Do NOT run multiple commands/processes simultaneously**.
- **Do NOT keep terminal processes running in the background** after validation/execution is complete.
- **Do NOT automatically start Node.js, MongoDB, browser preview, or any development server**.
- **Do NOT repeatedly scan/search the entire project** after every small change if details have already been located.
- **Prioritize lightweight code inspection and targeted edits** to avoid unnecessary CPU, RAM, disk, and browser usage.

## Development and Validation Workflow
1. Make the requested code/CSS/JS changes.
2. Review the changed files statically.
3. Check for syntax errors using lightweight commands only.
4. Do NOT open the website automatically.
5. Do NOT run browser-based tests unless explicitly asked by the user.
6. If server validation is necessary, start the server only briefly to verify startup, and immediately stop it.

## Completion Response Format
Before finishing, provide ONLY:
- **Files changed**: (List of files)
- **What was improved**: (Key improvements)
- **Any potential issue found**: (Warnings or bugs noticed)
- **Whether the code passed static/syntax validation**: (Yes/No with simple details)

**WAIT for user instruction before opening or testing the website in a browser.**
