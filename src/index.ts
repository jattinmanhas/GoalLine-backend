import express, {
  Application,
  urlencoded,
  json,
  raw,
} from "express";
import { config } from "dotenv";
config();
import cors from "cors";
import { router } from "./routes/index.route";
import { errorHandlerMiddleware } from "./middleware/errorHandlingMiddleware";
import userJwtStrategy from "./utils/Strategies/jwtUserStrategy";
import passport from "passport";
import jwtAdminStrategy from "./utils/Strategies/jwtAdminStrategy";
import morgan from "morgan";
import { stripeWebhook } from "./services/webhook";

const app: Application = express();
const port = process.env.PORT || 5000;


app.post("/webhook", raw({ type: "application/json" }), stripeWebhook);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));

userJwtStrategy(passport);
jwtAdminStrategy(passport);

app.use(router);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log("Server is listening on port: " + port);
});
