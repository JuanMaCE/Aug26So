import nodemailer from "nodemailer";
import { EmailProvider, EmailResult, SendEmailOptions } from "../email-provider.interface";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

/**
 * Proveedor de producción: envía correos vía un servidor SMTP
 * (Gmail, un host propio, etc.) usando nodemailer.
 */
export class SmtpProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    console.log(
      `[SmtpProvider] Configurado con host: ${config.host}:${config.port} (secure: ${config.secure}) para ${config.user}`
    );
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const fromAddress = process.env.EMAIL_FROM || '"Aug26 App" <no-reply@aug26so.com>';

      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
        html: options.html,
      });

      console.log(`[SmtpProvider] Correo enviado exitosamente a: ${options.to} (ID: ${info.messageId})`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("[SmtpProvider] Error al enviar correo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al enviar correo",
      };
    }
  }
}
