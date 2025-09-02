import { format } from '@/controllers';
import express from 'express';

export const appRouter = express.Router();
appRouter.post('/format', format);
