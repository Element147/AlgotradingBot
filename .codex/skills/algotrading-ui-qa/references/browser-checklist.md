# Browser Checklist

Use this order for browser QA in the repo:

1. Make sure the route is reachable through the repo's normal startup path.
2. Capture `browser_snapshot` before clicking.
3. Click or type against the current ref set only.
4. Re-run `browser_snapshot` after opening dialogs, changing tabs, submitting forms, or navigating between routes.
5. Inspect `browser_console_messages` when the UI is stale, blank, or partially rendered.
6. Inspect `browser_network_requests` when the visible state suggests a transport mismatch.
7. Take a screenshot only after the UI is in the state you want to preserve.

Prefer Playwright artifacts over desktop screenshots. Use the installed `screenshot` skill only when the browser cannot capture the state you need.
