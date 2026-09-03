import { EmailProvider } from "./email-provider.interface";
import { SmtpProvider } from "./providers/smtp-provider";
import { EtherealProvider } from "./providers/ethereal-provider";
import { ResendProvider } from "./providers/resend-provider";

let cachedProvider: EmailProvider | null = null;


export function createEmailProvider(): EmailProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  if (process.env.RESEND_API_KEY) {
    console.log("[EmailProviderFactory] Usando ResendProvider");
    cachedProvider = new ResendProvider(process.env.RESEND_API_KEY);
    return cachedProvider;
  }

  const host =
    process.env.SMTP_HOST || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (host && user && pass) {
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : host === "smtp.gmail.com" ? 465 : 587;
    const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : port === 465;

    console.log("[EmailProviderFactory] Usando SmtpProvider");
    cachedProvider = new SmtpProvider({ host, port, secure, user, pass });
    return cachedProvider;
  }

  console.log("[EmailProviderFactory] Sin credenciales configuradas, usando EtherealProvider");
  cachedProvider = new EtherealProvider();
  return cachedProvider;
}

export function resetEmailProviderCache(): void {
  cachedProvider = null;
}
