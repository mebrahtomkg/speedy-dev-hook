import { format, listScripts, runScript } from '@/controllers';
import express from 'express';

export const appRouter = express.Router();
appRouter.post('/format', format);
appRouter.get('/scripts', listScripts);
appRouter.get('/run-script', runScript);
