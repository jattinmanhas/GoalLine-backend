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
import { connectToRabbitMQ } from "./config/rabbitmq";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { startFileUploadConsumer } from "./utils/consumers/fileUploadConsumer";
import { seedRoles } from "./utils/seeding/RoleSeeding";
import prisma from "./config/prismaConfig";
import cookieParser from "cookie-parser";

const app: Application = express();
const port = process.env.PORT || 5000;

// Stripe Webhook
app.post("/webhook", raw({ type: "application/json" }), stripeWebhook);

// Application should be able to parse JSON payloads.
app.use(json());

// Middleware to parse cookies
app.use(cookieParser());

// RabbitMQ connection for file upload.
connectToRabbitMQ().then(() => {
  console.log('RabbitMQ initialized');
  startFileUploadConsumer();
}).catch((err) => {
  console.error('Failed to initialize RabbitMQ', err);
})

// temp directory for file uploads.
const tempDir = path.join(__dirname, 'temp');
if (!existsSync(tempDir)) {
  mkdirSync(tempDir);
}

// Application should be able to parse URL encoded payloads.
app.use(urlencoded({ extended: true }));

// CORS configuration of our application
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// 
app.use(morgan("dev"));

userJwtStrategy(passport);
jwtAdminStrategy(passport);

app.use(router);

app.use(errorHandlerMiddleware);

app.listen(port, async () => {
  await seedRoles(prisma);
  console.log("Server is listening on port: " + port);
});
