import express from 'express';
import authMobileRouter from './auth-mobile-router';
import authRouter from './auth-router';
import indexingRouter from './indexing-router';
import cronRouter from './cron-router';

/**
 * @description Handles all V1 routes
 */
const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/cron', cronRouter);
v1Router.use('/auth-mobile', authMobileRouter);
v1Router.use('/indexing', indexingRouter);

export default v1Router;
