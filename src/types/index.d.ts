import session from 'express-session';

export = session;

declare module 'express-session' {
	interface SessionData {
		views: number;
		deviceInfoHash: string;
		isAnonymous: boolean;
	}
}
