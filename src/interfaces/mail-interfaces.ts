import { Attachment } from 'nodemailer/lib/mailer';

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
