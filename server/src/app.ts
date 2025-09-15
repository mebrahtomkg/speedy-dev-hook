import bodyParser from 'body-parser';
import express from 'express';
import { errorHandler, serverLifeManager } from './middlewares';
import { appRouter } from './routes';

const app = express();

// This middleware will extend life time of the server on each(any) request.
// It should be used before any middleware to let any request pass through it.
app.use(serverLifeManager);

app.use(bodyParser.json());

app.use('/', appRouter);

app.use(errorHandler);

export default app;
