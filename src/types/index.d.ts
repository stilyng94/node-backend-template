import { User } from '@prisma/client';
import session from 'express-session';

export = session;
type MinUser = Pick<User, 'email' | 'id' | 'isActive'>;

declare module 'express-session' {
	interface SessionData {
		views: number;
		deviceInfoHash: string;
		isAnonymous: boolean;
		user: MinUser;
	}
}
