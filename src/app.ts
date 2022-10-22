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
import redisClient from './libs/redis-client';
import initAppRoutes from './router/init-app-routes';
import { pinoConsoleTransportConfig, pinoSentryStream } from './libs/logger';

const RedisStore = connectRedis(expressSession);
const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ optionsSuccessStatus: 200, credentials: true }));

app.use(
	expressSession({
		secret: process.env.SECRET ?? 'testing',
		name: 'sid',
		resave: false,
		saveUninitialized: false,
		store: new RedisStore({ client: redisClient, disableTouch: true }),
		cookie: {
			secure: ['production', 'staging'].includes(process.env.NODE_ENV ?? ''),
			httpOnly: true,
			signed: false,
			sameSite: 'lax', // csrf
			maxAge: 1000 * 60 * 60 * 24 * 30, // 30days
		},
	})
);

app.use((req, _, next) => {
	if (!req.session) {
		return next(new Error('Session not initialized'));
	}
	return next();
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use(hpp());

app.use(
	pinoHttp(
		['production', 'staging'].includes(process.env.SENTRY_ENVIRONMENT ?? '')
			? {}
			: pinoConsoleTransportConfig,
		['production', 'staging'].includes(process.env.SENTRY_ENVIRONMENT ?? '')
			? pinoSentryStream
			: undefined
	)
);

app.use(express.static(path.join('public')));

initAppRoutes(app);

app.use('*', (req) => {
	throw new NotFoundError(req);
});

app.use(globalErrorHandler);

export default app;
