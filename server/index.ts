import dotenv from "dotenv";
dotenv.config(); // This line loads your .env file

import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5000',
    // Remember to add your production frontend URL here when you have it
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const server = await registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`serving on port ${port}`);
  });
})();