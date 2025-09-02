### External Integrations Map (Read-Only)

This map documents current integration code paths and behaviors found in the repository. No implementation changes; only references.

### Magento

- Service: `src/services/magento/index.ts`
  - Auth: Bearer token header `Authorization: Bearer <token>`; optional `Store` header; configurable baseUrl/storeCode/timeout via `configure()` (lines ~125–142). Timeout default 30s (line ~120).
  - Endpoints used (relative to `<baseUrl>/rest/V1`):
    - `/store/storeConfigs` for connection test (lines ~221–225)
    - `/orders` with `searchCriteria[...]` query parameters (lines ~311–346)
    - `/orders/{id}` (line ~348)
    - `/products` with `searchCriteria[...]` (lines ~401–446)
    - `/products/{sku}` (line ~457)
    - `/invoices` similarly with searchCriteria (lines ~360–394)
    - `/invoices/{id}` (line ~396)
  - Retry/timeout: Uses `AbortController` to enforce timeout (lines ~155–170); no explicit retries. Errors handled via `handleApiError` with context (lines ~174–205).
  - Env/config: Consumed via `configure(config: MagentoConfig)`; code expects `baseUrl`, `token`, `storeCode`, optional `timeout` (no direct `process.env.*` reads in this file).
  - Fallback: If not configured or failing, falls back to Supabase-backed `magentoDataService` for products/orders/invoices (lines ~449–466, ~470–666).
  - Current UI usage: General product/order flows use internal Supabase stores; Magento service provides optional external sync. No direct page calls found besides the service and product store fallback.

### EDI

- Service: `src/services/supplierIntegration/ediService.ts`
  - Protocol: HTTP POST of XML payloads to supplier `edi_endpoint` (lines ~375–423).
  - Auth: Basic Auth headers when `edi_username`/`edi_password` present (lines ~386–390).
  - Config source: Supplier `integration_config` from `suppliers` table; fields include `edi_endpoint`, `edi_partner_id`, optional `edi_format`, credentials (lines ~64–77, ~121–133).
  - Formats supported: `EDIFACT_ORDERS` (D.96A), `X12_850`, fallback generic XML; generator methods build XML strings (lines ~175–252 for EDIFACT, ~257–319 for X12, ~324–370 for generic).
  - Payload: Built from `SupplierOrder` (from order splitting store) + practice details (buyer party) and supplier party; includes items with `sku`, `quantity`, `unit_price` (lines ~90–119).
  - Persistence: Inserts into `supplier_orders` with response data (lines ~428–452).
  - Current usage: Invoked from order orchestration layer for sending supplier-specific orders (see central service below).

### Email orders with PDFs

- Service: `src/services/supplierIntegration/pdfService.ts`
  - Purpose: Generate a PDF-like HTML blob and simulate emailing to supplier contact with attachment.
  - Data sources: `suppliers` and `practices` tables for meta and styling (lines ~41–54).
  - PDF generation: Renders HTML with inline CSS via `generatePDFHTML` and returns Blob (`text/html`) as a placeholder (lines ~137–303, ~447–455). Notes suggest real PDF libs (Puppeteer/jsPDF) for production.
  - Email sending: Simulated logger; no real outbound email API; logs a fake download link and details (lines ~569–597). Records `supplier_orders` entry (lines ~602–626).
  - Config: `PDFConfig` supports templates, logo inclusion, terms, CC/BCC, custom CSS (lines ~8–19).
  - Current usage: Used when supplier integration requires email/PDF method from orchestration.

### Error handling & observability

- Central handler: `src/utils/service-error-handler.ts`
  - `ServiceErrorHandler` provides `handle`, `handleSupabaseError`, `handleApiError`, `wrap`, `validateRequired` with logging to `apiLogger` and monitoring via `monitoringService` (lines ~33–120, ~262–309).
  - Categorization and user messaging via `ErrorHandler` (lines ~371–632); UI bubble-up currently mostly via `$q.notify` in pages; central handler includes a commented Notify example (lines ~546–555).
  - Monitoring hooks: Global unhandled rejection and JS error listeners set up in `setupGlobalHandlers()` (lines ~589–631).

### Orchestration / Where invoked from UI

- High-level integration: `src/services/integration/inventoryOrderIntegration.ts`
  - Initializes automation, creates notifications, and orchestrates reorder workflows (lines ~19–105, ~110–252).
  - Delegates creation of multi-supplier orders to `centralOrderService` (file not opened here) and then downstream to supplier integrations (EDI/PDF) based on supplier setup.
  - User flows: Triggered from platform/admin or automated schedules; users see results on Orders screens and Notifications.

### Gaps / Blockers

- Magento
  - No env var wiring in this repo for `baseUrl`/`token`; service relies on runtime `configure`. Missing persistent settings UI/storage in the present code snapshot.
  - No explicit retries/backoff; only timeout via AbortController.

- EDI
  - Endpoint auth uses only Basic or none; no OAuth/signing; no retry/timeout/backoff; no response schema validation.
  - XML generation is inline string-building; no schema validation; potential brittleness.

- Email/PDF
  - Email sending is simulated (logs) — no real email provider integration; PDF generation is HTML blob rather than a true PDF.
  - No attachment storage nor audit trail beyond `supplier_orders.response_data`.

- Error handling
  - Many page-level `$q.notify({ type: 'negative' })` paths; not all flows use `ServiceErrorHandler` consistently.

- End-to-end ordering
  - Actual dispatch to EDI/PDF depends on orchestration logic in `centralOrderService` (not reviewed here). If that layer is stubbed or partially implemented, end-to-end sending may be blocked.


