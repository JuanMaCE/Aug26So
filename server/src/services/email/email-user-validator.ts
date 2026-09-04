import crypto from "node:crypto";
import { EmailService } from "./email.service.js";
import type { User } from "../users/user.types.js";
import type { UserValidator, ValidationResult } from "./user-validator.interface.js";

interface PendingToken {
  userId: string;
  expiresAt: number;
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas


export class EmailUserValidator implements UserValidator {
  private pendingTokens = new Map<string, PendingToken>();

  async validate(user: User): Promise<ValidationResult> {
    const token = crypto.randomBytes(32).toString("hex");
    this.pendingTokens.set(token, { userId: user.id, expiresAt: Date.now() + TOKEN_TTL_MS });

    const verificationLink = `${process.env.APP_URL || "http://localhost:3000"}/api/verify?token=${token}`;

    const newEmailService = new EmailService();

    const result = await newEmailService.sendEmail({
      to: user.email,
      subject: "Verifica tu cuenta",
      html: `<p>Hola ${user.name}, confirma tu cuenta haciendo clic <a href="${verificationLink}">aquí</a>. El link vence en 24 horas.</p>`,
      text: `Confirma tu cuenta visitando: ${verificationLink} (vence en 24 horas)`,
    });

    if (!result.success) {
      return { success: false, message: result.error || "No se pudo enviar el correo de verificación" };
    }

    return {
      success: true,
      message: "Correo de verificación enviado",
      previewUrl: result.previewUrl ? result.previewUrl : null,
    };
  }

  confirmToken(token: string): ValidationResult {
    const pending = this.pendingTokens.get(token);
    if (!pending) {
      return { success: false, message: "Token inválido o ya utilizado" };
    }
    if (Date.now() > pending.expiresAt) {
      this.pendingTokens.delete(token);
      return { success: false, message: "Token expirado" };
    }
    this.pendingTokens.delete(token);
    return { success: true, message: `Usuario ${pending.userId} verificado` };
  }
}

export const emailUserValidator = new EmailUserValidator();
