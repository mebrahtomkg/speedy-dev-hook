import { format, listScripts, runScript, smartSelect } from '@/controllers';
import express from 'express';

export const appRouter = express.Router();
appRouter.post('/format', format);
appRouter.get('/scripts', listScripts);
appRouter.get('/run-script', runScript);
appRouter.post('/smart-select', smartSelect);
