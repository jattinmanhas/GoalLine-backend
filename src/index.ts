import express, { Application, urlencoded, json, Request, Response } from "express";
import { config } from "dotenv";
config();
import cors from 'cors';
import { router } from "./routes/index.route";
import { errorHandlerMiddleware } from "./middleware/errorHandlingMiddleware";
import userJwtStrategy from "./utils/Strategies/jwtUserStrategy";
import passport from "passport"
import jwtAdminStrategy from "./utils/Strategies/jwtAdminStrategy";

const app : Application = express();
const port = process.env.PORT || 5000;

app.use(json());
app.use(urlencoded({extended: true}))
app.use(cors({
    origin: 'http://localhost:3000/',
    credentials: true
}))

userJwtStrategy(passport);
jwtAdminStrategy(passport);

app.use(router);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
    console.log("Server is listening on port: "+ port);
})