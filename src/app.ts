import express, { json, urlencoded } from 'express';
import path from 'path';
import pinoHttp from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import hpp from 'hpp';
import NotFoundError from './errors/not-found-error';
import globalErrorHandler from './middleware/global-error-handler';
import routeRateLimiter from './middleware/route-rate-limiter';
import redisClient from './libs/redis-client';

const RedisStore = connectRedis(expressSession);
const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ optionsSuccessStatus: 200, credentials: true }));
app.use(routeRateLimiter);

app.use(
	expressSession({
		secret: process.env.SECRET ?? 'testing',
		resave: false,
		saveUninitialized: false,
		store: new RedisStore({ client: redisClient }),
		cookie: {
			secure: ['production', 'staging'].includes(process.env.NODE_ENV ?? ''),
			httpOnly: true,
			sameSite: true,
		},
	})
);

app.use((req, _, next) => {
	if (!req.session) {
		return next(new Error('Session not initialized'));
	}
	return next();
});

app.use(hpp());
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(pinoHttp({ timestamp: true, enabled: true }));

app.use(express.static(path.join('public')));

app.use('/health-check', (req, res) => {
	req.session.healthCheckCount = req.session.healthCheckCount ?? 0 + 1;
	return res.sendStatus(200);
});

app.use('*', (req) => {
	throw new NotFoundError(req);
});

app.use(globalErrorHandler);

export default app;
