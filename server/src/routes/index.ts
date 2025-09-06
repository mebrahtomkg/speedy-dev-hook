import { format, listScripts } from '@/controllers';
import express from 'express';

export const appRouter = express.Router();
appRouter.post('/format', format);
appRouter.get('/scripts', listScripts);
