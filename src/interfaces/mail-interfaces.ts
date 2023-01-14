import { Attachment, Options } from 'nodemailer/lib/mailer';

/**
 * @description Base email interface
 */
export interface IBaseEmailInput {
	to: string[];
	cc?: string[];
	bcc?: string[];
	from: string;
	subject: string;
	attachments?: Attachment[];
}

export type IEMailInput = IBaseEmailInput & Required<Pick<Options, 'html'>>;

export type IPromotionalEMailInput = IEMailInput &
	Required<Pick<Options, 'list'>>;
