import bodyParser from 'body-parser';
import express from 'express';
import { errorHandler } from './middlewares';
import { appRouter } from './routes';

const app = express();

app.use(bodyParser.json());

app.use('/', appRouter);

app.use(errorHandler);

export default app;
