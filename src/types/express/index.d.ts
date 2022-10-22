import { User } from '@prisma/client';
import express from 'express';

export = express;

declare module 'express' {
	interface Request {
		userNameIpKey?: string;
		deviceInfo?: string;
		user?: User;
	}
}
