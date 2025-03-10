import 'express-async-errors'
import express from 'express';
import initRoutes from './route/routes.ts';
import cors from 'cors';

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.use(cors({
    origin: '*'
}))

initRoutes(app);

app.use("/images", express.static(path.join(__dirname, "../images")));


app.listen(port, () => console.log(`Acesse: http://localhost:${port}/`));
