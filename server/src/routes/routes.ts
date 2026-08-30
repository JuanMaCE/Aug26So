import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { EmailValidator } from "./validator.js";
import { sendEmail, sendWelcomeEmail } from "../services/emailService.js";

const router = Router();
const emailValidator = new EmailValidator();

// GET /users -> listar todos
router.get("/users", async (_req, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET /users/:id -> obtener uno
router.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// POST /users -> crear usuario y enviar correo de bienvenida/confirmación
router.post("/users", async (req, res) => {
  try {
    const { email, name, secondName, age, password } = req.body;

    if (!email || !name || !secondName || !age || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: "Formato de correo electrónico inválido" });
    }

    const result = await db.insert(users).values({
      email,
      name,
      secondName,
      age: Number(age),
      password, // recuerda hashear esto antes de guardarlo (bcrypt, argon2, etc.)
    });

    // Enviar correo de bienvenida/registro
    const emailResult = await sendWelcomeEmail({
      to: email,
      name,
      secondName,
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      insertId: result[0].insertId,
      emailSent: emailResult.success,
      emailPreview: emailResult.previewUrl || null,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// POST /send-email -> Endpoint para enviar correos electrónicos personalizados o de confirmación
router.post("/send-email", async (req, res) => {
  try {
    const { to, subject, html, text, name, secondName, type } = req.body;

    if (!to || !emailValidator.validate(to)) {
      return res.status(400).json({ error: "Dirección de correo electrónico inválida o no proporcionada" });
    }

    let emailResult;

    if (type === "welcome" || (!html && !subject)) {
      emailResult = await sendWelcomeEmail({
        to,
        name: name || "Usuario",
        secondName: secondName || "",
      });
    } else {
      if (!subject || (!html && !text)) {
        return res.status(400).json({ error: "Faltan campos: subject y html/text son obligatorios" });
      }

      emailResult = await sendEmail({
        to,
        subject,
        html: html || `<p>${text}</p>`,
        text,
      });
    }

    if (emailResult.success) {
      res.json({
        message: "Correo enviado exitosamente",
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl || null,
      });
    } else {
      res.status(500).json({
        error: "No se pudo enviar el correo electrónico",
        details: emailResult.error,
      });
    }
  } catch (error) {
    console.error("Error al procesar envío de correo:", error);
    res.status(500).json({ error: "Error interno al enviar el correo" });
  }
});

// PUT /users/:id -> actualizar
router.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { email, name, secondName, age, password } = req.body;

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (email && !emailValidator.validate(email)) {
      return res.status(400).json({ error: "Formato de correo electrónico inválido" });
    }

    await db
      .update(users)
      .set({
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
        ...(secondName ? { secondName } : {}),
        ...(age ? { age: Number(age) } : {}),
        ...(password ? { password } : {}),
      })
      .where(eq(users.id, id));

    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// DELETE /users/:id -> eliminar
router.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await db.delete(users).where(eq(users.id, id));

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;