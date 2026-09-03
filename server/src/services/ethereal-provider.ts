import nodemailer from "nodemailer";
import { EmailProvider, EmailResult, SendEmailOptions } from "../email-provider.interface";


export class EtherealProvider implements EmailProvider {
  private transporterPromise: Promise<nodemailer.Transporter> | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporterPromise) {
      this.transporterPromise = (async () => {
        console.log("[EtherealProvider] Creando cuenta de prueba Ethereal...");
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`[EtherealProvider] Cuenta de prueba lista (${testAccount.user})`);
        return transporter;
      })();
    }
    return this.transporterPromise;
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const transporter = await this.getTransporter();
      const fromAddress = process.env.EMAIL_FROM || '"Aug26 App" <no-reply@aug26so.com>';

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
        html: options.html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[EtherealProvider] Correo enviado a: ${options.to} (ID: ${info.messageId})`);
      if (previewUrl) {
        console.log(`[EtherealProvider] Vista previa: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      console.error("[EtherealProvider] Error al enviar correo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al enviar correo",
      };
    }
  }
}
