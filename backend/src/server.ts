import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { PORT } from "./config/index.config";
import { corsOptions } from "./middlewares/cors.options.middleware";
import authRouter from "./routers/auth.router";
import profileRouter from "./routers/profile.router";
import { MulterError } from "multer";

dotenv.config();

const app: Express = express();

// Middlewares
app.use(corsOptions);
app.use(express.json());

// app.get("/", (_req: Request, res: Response) => {
//   res.send("Travel App API is Running 🚀");
// });

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

/*
  Middleware (Application Level)
*/
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err?.statusCode ? err?.statusCode : 500;
  const message = err?.isOperational ? err?.message : "Something went wrong!";

  // Log error untuk debugging di server
  console.error("❌ Error:", err);

  // Multer Error
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size is too large",
        data: null,
      });
      return;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default app;
