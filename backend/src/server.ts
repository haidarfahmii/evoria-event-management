import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { PORT } from "./config/index.config";
import { corsOptions } from "./middlewares/cors.options.middleware";
import authRouter from "./routers/auth.router";

dotenv.config();

const app: Express = express();

// Middlewares
app.use(corsOptions);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Travel App API is Running 🚀");
});

app.use("/api/auth", authRouter);

/*
  Middleware (Application Level)
*/
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default app;
