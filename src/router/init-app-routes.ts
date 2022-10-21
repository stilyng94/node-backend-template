import { Application } from 'express';
import v1Router from './v1/v1-router.ts';

/**
 * @description Initialize all routes here
 */
const initAppRoutes = (app: Application) => {
	//! v1 routes
	app.use('/api/v1', v1Router);
};
export default initAppRoutes;
