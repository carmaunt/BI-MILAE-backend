import express from "express";
import cors from "cors";
import milaeRoutes from "./routes/milae";
import authRoutes from "./routes/auth";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/milae", milaeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
