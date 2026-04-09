# Browser Checklist

Use this order for browser QA in the repo:

1. Make sure the route is reachable through the repo's normal startup path.
2. Use `http://localhost:5173` only when Playwright is running locally on the workstation; use `http://host.docker.internal:5173` when the browser is running inside Docker or another container.
3. Capture `browser_snapshot` before clicking.
4. Click or type against the current ref set only.
5. Re-run `browser_snapshot` after opening dialogs, changing tabs, submitting forms, or navigating between routes.
6. Inspect `browser_console_messages` when the UI is stale, blank, or partially rendered.
7. Inspect `browser_network_requests` when the visible state suggests a transport mismatch.
8. Take a screenshot only after the UI is in the state you want to preserve.

Prefer Playwright artifacts over desktop screenshots. Use the installed `screenshot` skill only when the browser cannot capture the state you need.
