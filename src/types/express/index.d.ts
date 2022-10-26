declare namespace Express {
	export interface User {
		id: string;
		email: string;
		isActive: boolean;
	}
	export interface Request {
		userNameIpKey?: string;
		deviceInfo?: string;
	}
}
