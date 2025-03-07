import express from 'express';
import initRoutes from './route/routes.ts';
import cors from 'cors';

const app = express();
const port = 8080;

app.use(cors({
    origin: '*'
}))

initRoutes(app);


app.listen(port, () => console.log(`Acesse: http://localhost:${port}/`));
