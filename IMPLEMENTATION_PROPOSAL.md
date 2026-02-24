# Healthy Tem — Web Labeling System Proposal

## 1) Project Scope Summary
A bilingual (Arabic + English) web application for **Healthy Tem** to manage products and generate/print professional nutrition labels (5×7 cm), with role-based access, archive/history, and export/print workflows.

## 2) Recommended Technical Stack
- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Backend/API:** Next.js API routes or NestJS (depending on scale)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth/Auth.js with roles (Admin, Staff)
- **PDF/Printing:** server-side PDF generation (PDFKit or Puppeteer HTML-to-PDF)
- **i18n:** next-intl (full Arabic/English UI and label fields)
- **Storage:** Object storage (S3-compatible) for logos and archived PDFs
- **Deployment:** Dockerized app on VPS/Cloud instance with Nginx + SSL

## 3) High-Level Modules
1. **Products Management**
   - Create, update, delete, activate/hide products
   - Category management (sandwiches, juices, desserts, etc.)
   - Search/filter
2. **Label Generator**
   - Live preview of 5×7 cm label
   - Official nutrition-card style
   - Restaurant name + logo + configurable colors + QR
   - Optional batch/production/expiry fields
3. **Printing & Export**
   - Direct print
   - Single-label PDF export (5×7 cm)
   - Batch printing (multiple labels on A4)
   - Copies count per label
4. **Saved Labels / History**
   - Archive generated labels
   - Log fields: product name, date, copies, creator
   - Re-download historical PDFs
5. **Settings & Access Control**
   - Brand name/logo/colors/QR link
   - User management (Admin vs Staff)

## 4) Estimated Timeline
- **Discovery + UI/UX wireframe:** 3–5 days
- **Core development (MVP):** 2–3 weeks
- **PDF/print tuning + QA:** 4–6 days
- **Deployment + handover + training:** 2–3 days

**Total estimated duration:** **4 to 6 weeks** for a production-ready v1.

## 5) Estimated Cost (Approximate)
> Pricing depends on final detail depth, branding complexity, and revision cycles.

- **MVP (core features only):** **$2,500 – $4,000**
- **Professional v1 (full requested scope):** **$4,500 – $8,000**
- **Advanced phase (analytics, integrations, multi-branch):** **+$2,000 – $6,000**

## 6) Hosting Plan Recommendation
### Option A (Balanced Cost/Performance)
- VPS (4 vCPU / 8 GB RAM / 160 GB SSD)
- Docker + Nginx reverse proxy
- PostgreSQL managed or self-hosted
- Object storage for PDFs/logos
- Daily automated backups
- SSL via Let's Encrypt

**Approx monthly ops cost:** **$40 – $150** depending on provider and managed services.

### Option B (Managed Cloud)
- App on Render/Railway/Fly.io + managed PostgreSQL + object storage
- Easier maintenance, slightly higher recurring cost

**Approx monthly ops cost:** **$80 – $250**.

## 7) Security & Reliability Checklist
- HTTPS/SSL enforced
- Role-based access (Admin/Staff)
- Audit-friendly label history
- Input validation and sanitized PDF rendering
- Daily DB backup + weekly restore test
- Monitoring + error logging (Sentry/Logtail)

## 8) Suggested Delivery Phases
1. **Phase 1:** Product management + bilingual base + auth
2. **Phase 2:** Label generator + PDF + print layouts
3. **Phase 3:** History/archive + settings + user roles
4. **Phase 4:** Hardening, QA, deployment, and team training

## 9) Notes for Domain & SSL
- You can use your own private domain (e.g., `labels.healthytem.com`).
- SSL certificate can be automated and renewed without manual intervention.

---

If needed, this proposal can be converted next into:
- a fixed-price scope document,
- a weekly implementation plan,
- and a full database schema + API contract.
