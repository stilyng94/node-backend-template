import express from 'express';

export = express;

declare module 'express' {
	interface Request {
		userNameIpKey?: string;
		deviceInfo?: string;
	}
}
