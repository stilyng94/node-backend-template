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
	subject: string;
	attachments?: Attachment[];
}

export type IEmailObj = Omit<IEMailInput, 'html'>;
