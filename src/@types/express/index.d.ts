declare namespace Express {
	export interface User {
		id: string;
	}
	export interface Request {
		userNameIpKey?: string;
		deviceInfo?: string;
	}
}
