import { Attachment } from 'nodemailer/lib/mailer';

/**
 * @description Base email interface
 */
export interface IEmailObj {
	to: string[];
	cc?: string[];
	bcc?: string[];
	from: string;
	subject: string;
	attachments?: Attachment[];
}

export type IEMailInput = IEmailObj & { html?: string };
