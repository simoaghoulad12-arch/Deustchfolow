# Backup / Recovery — Production Requirements

Status: **BLOCKED — no external infrastructure exists in this environment,
and none is installed here per the phase's explicit instruction** ("noch
keine externe Infrastruktur installieren, wenn sie nicht vorhanden ist").
This document states requirements for whoever provisions production
infrastructure; it does not (and cannot, from this sandbox) verify any of
it actually works.

## PostgreSQL

- **Automated backups:** the production Postgres instance (wherever it's
  hosted — this repo has no opinion on provider) must have automated,
  scheduled backups enabled. Most managed Postgres providers (RDS, Cloud
  SQL, Supabase, Neon, Railway, etc.) offer this as a checkbox — verify it
  is actually on, not just available.
- **Point-in-time recovery (PITR):** given this product handles real
  money (Stripe payments, refunds, payouts) and real personal data,
  PITR — not just daily snapshots — should be enabled so a bad migration
  or a data-corrupting bug can be recovered from without losing an entire
  day of financial records.
- **Restore drills:** a backup that has never been restored is not a
  verified backup. Before real launch, actually restore a backup to a
  scratch instance and confirm the data is intact and the application can
  connect to it.

## Migration rollback

- Every migration in `packages/database/prisma/migrations/` is a plain
  forward-only SQL file (Prisma's default). There is no automated
  rollback tooling in this repo. For a destructive-looking migration
  (column drop, type change), the operational practice must be: take a
  fresh backup immediately before applying it in production, and have a
  hand-written down-migration ready if the change is anything more
  complex than an additive index/column.
- This phase's own new migration
  (`20260818110000_payment_stripe_charge_id_index`) is purely additive
  (one `CREATE INDEX`) — zero rollback risk.

## Storage backup (tutor verification documents)

- The current document storage provider is `LocalDocumentStorageProvider`
  — filesystem-based, intended for local development. **Whatever replaces
  it for production** (S3, GCS, etc. — not decided in this codebase) must
  itself be backed up or use a provider with built-in durability/versioning
  (e.g., S3 versioning + cross-region replication), since these documents
  (tutor CVs, certificates) have no other copy anywhere in the system.

## What this phase did NOT do

No backup infrastructure was provisioned or configured — there is nothing
to provision from inside this sandboxed development environment, and
doing so blindly would violate the phase's explicit "no overengineering /
don't install infrastructure that doesn't exist" instruction. This
document exists so the requirement is not silently missing when a real
production environment gets built.
