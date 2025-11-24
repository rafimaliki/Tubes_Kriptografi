import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.routes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";
import { requestLogger } from "./middlewares/log.middleware";
import { createServer } from "http";
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api", apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(
    `To seed the database, run: docker-compose exec backend npm run db:seed`
  );
  const apiBaseUrl =
    process.env.API_BASE_URL ||
    `http://localhost:${port === 3000 ? 3001 : port}`;
  console.log(
    `Swagger docs available at ${apiBaseUrl.replace("/api", "")}/api-docs`
  );
});
