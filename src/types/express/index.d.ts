declare namespace Express {
	export interface User {
		id: string;
		email: string;
		isActive: string;
	}
	export interface Request {
		userNameIpKey?: string;
		deviceInfo?: string;
	}
}
