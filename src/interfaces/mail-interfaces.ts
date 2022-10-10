import { Attachment } from 'nodemailer/lib/mailer';

export type TransmissionResult = 'success' | 'failure' | 'bounced';

/**
 * @description Email input
 */
export interface IEMailInput {
	to: string[];
	cc?: string[];
	bcc?: string[];
	from: string;
	html?: string;
	text?: string;
	subject: string;
	attachments?: Attachment[];
}

export interface IEMailResult {
	message?: string;
	result: TransmissionResult;
}
