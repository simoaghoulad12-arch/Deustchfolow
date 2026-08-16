export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

/** Implemented by each concrete transport (dev console, and later a real provider). */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}
