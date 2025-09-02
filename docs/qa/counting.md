## Counting flow QA

Follow these steps to verify the stabilized counting flow.

### Pre-requisites
- You are logged in and have an active practice with locations and products.

### 1) Start a session
1. Open `Inventory → Counting`.
2. Click “Start session”.
3. Fill in name, type, select one or more locations, set options as needed.
4. Submit.
   - Expected: dialog closes and you navigate to `/inventory/counting/:sessionId`.
   - Database: `counting_sessions` has `practice_id`, `started_by`, `status=active`, options fields, and `location_ids` stored.

### 2) Session page fetch
1. Ensure URL contains the new `sessionId`.
2. Refresh the page.
   - Expected: the session is fetched directly by `id` and `practice_id`.
   - For completed/approved sessions: entries load only for this session and show product name/SKU and location name.

### 3) Add entries (active session)
1. Use the mobile interface to count a few products.
   - Expected: each entry saves `system_quantity`, `counted_quantity`, and `variance=counted-system`.
   - Session progress updates.

### 4) Post session
Case A: Require approval ON
1. Complete the session.
2. Click Approve/Post.
   - Expected: session moves to review/approved state without creating movements (status updates only).

Case B: Require approval OFF
1. Complete the session.
2. Click Approve/Post.
   - Expected: for each entry, stock movements are inserted with `movement_type='count'`, and stock levels are updated. Session becomes approved/posted.
   - A snackbar appears with an Undo action.

### 5) Undo (snackbar window)
1. Click Undo within the snackbar timeout.
   - Expected: movements from this post are deleted, stock is reverted via correction RPC, and session returns to `active`.

### 6) Mobile layout
- On small screens, verify that table cells wrap and no fixed-width columns cause overflow on counting pages.

### Error handling
- Disconnect network and attempt to load the session/entries.
  - Expected: an error banner appears with a Retry button.


