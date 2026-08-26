import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { Router } from "express";
import { eq } from "drizzle-orm";

const router = Router();

// GET /users -> listar todos
router.get("/users", async (req, res) => {
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

// POST /users -> crear
router.post("/users", async (req, res) =>    {
  try {
    const { email, name, secondName, age, password } = req.body;

    if (!email || !name || !secondName || !age || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const result = await db.insert(users).values({
      email,
      name,
      secondName,
      age,
      password, // recuerda hashear esto antes de guardarlo (bcrypt, argon2, etc.)
    });

    res.status(201).json({ message: "Usuario creado", insertId: result[0].insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuario" });
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

    await db
      .update(users)
      .set({ email, name, secondName, age, password })
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