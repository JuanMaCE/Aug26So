import { Router } from "express";
import type { Request, Response } from "express";
import { EmailValidator } from "./validator.js";
import { registerUserUseCase } from "../services/users/register-user.use-case.js";
import { emailUserValidator } from "../services/email/email-user-validator.js";
import { EmailService } from "../services/email/email.service.js";

const router = Router();
const emailValidator = new EmailValidator();
const emailService = new EmailService();

router.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, name, secondName, age, password, phone } = req.body;
    console.log("Datos recibidos para registro:", { email, name, secondName, age, password, phone });

    if (!email || !name || !secondName || !age || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }



    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: "Formato de correo electrónico inválido" });
    }
    const result = await registerUserUseCase.execute({
      email,
      name,
      secondName,
      age: Number(age),
      password,
      phone,
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: result.user,
      verificationSent: result.verificationSent,
      verificationMessage: result.verificationMessage,
      previewUrl: result.previewUrl,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// Ruta para verificar token enviado por correo
router.get("/verify", (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ error: "Token no proporcionado" });
  }

  const result = emailUserValidator.confirmToken(token);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ message: result.message });
});

// Ruta para reenviar correo (soporta el botón de reenvío en el frontend)
router.post("/send-email", async (req: Request, res: Response) => {
  try {
    const { to, name, secondName } = req.body;
    if (!to || !name) {
      return res.status(400).json({ error: "Faltan datos requeridos (to, name)" });
    }

    const result = await emailService.sendWelcomeEmail({
      to,
      name,
      secondName,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error || "No se pudo reenviar el correo" });
    }

    res.json({
      success: true,
      message: "Correo enviado exitosamente",
      previewUrl: result.previewUrl || null,
    });
  } catch (error) {
    console.error("Error al reenviar correo:", error);
    res.status(500).json({ error: "Error al reenviar correo" });
  }
});

export default router;