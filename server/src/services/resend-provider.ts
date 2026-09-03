import { EmailProvider, EmailResult, SendEmailOptions } from "../email-provider.interface";

/**
 * Ejemplo de un proveedor NUEVO agregado sin modificar
 * SmtpProvider, EtherealProvider ni el resto del sistema
 * (más allá de registrarlo en el factory) — así se ve cumplido OCP.
 * Usa la API HTTP de Resend en vez de SMTP.
 */
export class ResendProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const fromAddress = process.env.EMAIL_FROM || "no-reply@aug26so.com";

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>?/gm, ""),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Resend API respondió ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      console.log(`[ResendProvider] Correo enviado a: ${options.to} (ID: ${data.id})`);

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      console.error("[ResendProvider] Error al enviar correo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al enviar correo",
      };
    }
  }
}
