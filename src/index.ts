import express, { Application, urlencoded, json } from "express";
import { config } from "dotenv";
config();
import cors from 'cors';
import { router } from "./routes/index.route";

const app : Application = express();
const port = process.env.PORT || 5000;

app.use(json());
app.use(urlencoded({extended: true}))
app.use(cors({
    origin: 'http://localhost:3000/',
    credentials: true
}))

app.use(router);

app.listen(port, () => {
    console.log("Server is listening on port: "+ port);
})