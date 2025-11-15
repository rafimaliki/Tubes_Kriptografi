import express, { Express } from "express";
import dotenv from "dotenv";
import healthRouter from "./routes/health";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(
    `To seed the database, run: docker-compose exec backend npm run db:seed`
  );
});
