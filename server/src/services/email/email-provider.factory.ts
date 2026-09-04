import type { EmailProvider } from "./email-provider.interface.js";
import { SmtpProvider } from "./smtp-provider.js";
import { EtherealProvider } from "./ethereal-provider.js";

export class EmailProviderFactory {
  private cachedProvider: EmailProvider | null = null;

  
  createEmailProvider(): EmailProvider {
    if (this.cachedProvider) {
    return this.cachedProvider;
    }

    const host =
    process.env.SMTP_HOST || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (host && user && pass) {
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : host === "smtp.gmail.com" ? 465 : 587;
    const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : port === 465;

    this.cachedProvider = new SmtpProvider({ host, port, secure, user, pass });
    return this.cachedProvider;
    }

    this.cachedProvider = new EtherealProvider();
    return this.cachedProvider;
  }
}

export const emailProviderFactory = new EmailProviderFactory();