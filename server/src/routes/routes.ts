import { registerUserUseCase } from "../services/users/register-user.use-case.js";

router.post("/users", async (req, res) => {
  try {
    const { email, name, secondName, age, password } = req.body;

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
      password, // recuerda hashear esto antes de guardarlo
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: result.user,
      verificationSent: result.verificationSent,
      verificationMessage: result.verificationMessage,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});