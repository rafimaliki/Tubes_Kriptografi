import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.routes";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";
import { requestLogger } from "./middlewares/log.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use("/api", apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.listen(port, () => {
  console.log(`Server running on port 3001`);
  console.log(
    `To seed the database, run: docker-compose exec backend npm run db:seed`
  );
  console.log(`Swagger docs available at http://localhost:3001/api-docs`);
});
