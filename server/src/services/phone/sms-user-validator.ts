import type { User } from "../users/user.types.js";
import type { UserValidator, ValidationResult } from "../email/user-validator.interface.js";

export class SmsUserValidator implements UserValidator {
  
  async validate(user: User): Promise<ValidationResult> {
    console.log("Enviando SMS de verificación a:", user.phone);
    
    if (!user.phone) {
      return { success: false, message: "El usuario no tiene teléfono registrado" };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, message: "Twilio no está configurado (revisa tu .env)" };
    }

    try {
      const body = new URLSearchParams({
        To: "+50247121112",
        From: fromNumber,
        Body: `Hola ${user.name}, tu código de verificación es: ${this.generateCode()}`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
              Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
          },
          body,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        return { success: false, message: `Twilio respondió ${response.status}: ${errorBody}` };
      }

      return { success: true, message: "SMS de verificación enviado" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido al enviar SMS",
      };
    }
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}