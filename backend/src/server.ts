import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import eventsRouter from "./routers/events.route";
import { corsOptions } from "./middlewares/cors.options.middleware";
import { PORT } from "./config/index.config";
import { MulterError } from "multer";
import authRouter from "./routers/auth.route";
import profileRouter from "./routers/profile.route";
import dashboardRouter from "./routers/dashboard.route";
import transactionRouter from "./routers/transaction.route";
import reviewsRouter from "./routers/reviews.route";
import { startCronJobs } from "./utils/corn.util";

dotenv.config();

const app: Express = express();

// Middlewares
app.use(corsOptions);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Travel App API is Running 🚀");
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reviews", reviewsRouter)

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

  // Handle Prisma Validation / Database Errors
  if (err.code === "P2002") {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: "Data already exists (Unique constraint violation)",
      data: null,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
});

// start corn jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default app;
