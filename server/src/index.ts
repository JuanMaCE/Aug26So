import express from "express";
import cors from "cors";
import "dotenv/config";
import routes from "./routes/routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
