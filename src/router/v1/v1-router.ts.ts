import express from 'express';
import authRouter from './auth-router';
import queueRouter from './queue-router';

/**
 * @description Handles all V1 routes
 */
const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/queue', queueRouter);

export default v1Router;
