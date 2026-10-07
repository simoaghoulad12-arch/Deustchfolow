-- Phase 8: Rolle für Schüler. Eigene Migration, weil ein neuer Enum-Wert erst nach dem Commit nutzbar ist.
alter type public.app_role add value if not exists 'student';
