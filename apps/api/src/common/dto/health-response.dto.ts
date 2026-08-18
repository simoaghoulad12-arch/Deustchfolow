export class HealthResponseDto {
  status!: 'ok';
  timestamp!: string;
  uptime!: number;
  /** Real connectivity check (Phase 6.5 hardening — this used to be a
   * pure liveness stub that never reported it). Deliberately does not
   * flip `status`/the HTTP code: this stays a liveness signal ("is the
   * process itself alive and should not be restarted"), while
   * `database` is the separate, honest readiness signal for an
   * operator or monitoring dashboard to act on. */
  database!: 'ok' | 'error';
}
