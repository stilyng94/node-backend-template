import express, { json, urlencoded } from 'express';
import path from 'path';
import pinoHttp from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import NotFoundError from './errors/not-found-error';
import globalErrorHandler from './middleware/global-error-handler';
import routeRateLimiter from './middleware/route-rate-limiter';

const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ optionsSuccessStatus: 200 }));

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(pinoHttp({ timestamp: true, enabled: true }));

app.use(routeRateLimiter);

app.use(express.static(path.join('public')));

app.use('/health-check', (_, res) => res.sendStatus(200));

app.use('*', (req) => {
	throw new NotFoundError(req);
});

app.use(globalErrorHandler);

export default app;
