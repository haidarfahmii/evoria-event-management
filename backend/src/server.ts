import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Travel App API is Running 🚀");
});

/*
  Middleware (Application Level)
*/
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong!",
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
