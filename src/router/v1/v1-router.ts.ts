import express from 'express';
import authRouter from './auth-router';

/**
 * @description Handles all V1 routes
 */
const v1Router = express.Router();

v1Router.use('/auth', authRouter);

export default v1Router;
