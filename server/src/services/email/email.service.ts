import type { EmailProvider, SendEmailOptions, EmailResult } from "./email-provider.interface.js";
import { emailProviderFactory } from "./email-provider.factory.js";


export interface SendWelcomeEmailOptions {
  to: string;
  name: string;
  secondName?: string;
  verificationLink?: string;
}


export class EmailService {
    private provider: EmailProvider | null = null;

    sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    this.provider = emailProviderFactory.createEmailProvider();
    return this.provider.send(options);
    }
    
    sendWelcomeEmail({
    to,
    name,
    secondName = "",
    verificationLink = "http://localhost:5173",
    }: SendWelcomeEmailOptions): Promise<EmailResult> {
    const fullName = `${name} ${secondName}`.trim();
    const subject = `¡Bienvenido/a a nuestra plataforma, ${name}! 🎉`;
    
    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <body style="font-family: sans-serif; background:#0f172a; color:#f8fafc; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#1e293b; border-radius:16px; padding:32px;">
            <h1>¡Hola, ${fullName}! 👋</h1>
            <p>Gracias por registrarte. Tu cuenta con correo <strong>${to}</strong> fue creada correctamente.</p>
            <p><a href="${verificationLink}" style="color:#38bdf8;">Ir a la plataforma</a></p>
        </div>
        </body>
        </html>
    `;
    
    const text = `¡Hola, ${fullName}!\n\nTu cuenta con correo ${to} fue creada correctamente.\nAccede aquí: ${verificationLink}`;
    
    return this.sendEmail({ to, subject, html, text });
    }
}