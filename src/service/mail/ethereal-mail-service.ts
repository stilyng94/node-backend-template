import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from '../../config';
import MailService from './mail-service';

/**
 * @class EtherealMailService
 * @extends MailService<SMTPTransport.SentMessageInfo>
 * @description Send message using the free Ethereal mail service. Mostly used in development.
 * When a mail is sent, it logs the url which can be used to view the mail on their portal
 */
class EtherealMailService extends MailService {
	// eslint-disable-next-line class-methods-use-this
	protected createTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
		const port = config.SMTP_PORT;
		const secure = port === 465; // true for 465, false for other ports eg 587

		const options: SMTPTransport.Options = {
			host: 'smtp.ethereal.email',
			port,
			secure,
			auth: {
				user: config.ETHEREAL_USERNAME,
				pass: config.ETHEREAL_PASSWORD,
			},
		};
		return nodemailer.createTransport(options);
	}
}

export default EtherealMailService;
