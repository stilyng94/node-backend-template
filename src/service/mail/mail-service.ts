import { Transporter, getTestMessageUrl } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IEMailInput } from '../../interfaces/mail-interfaces';
import logger from '../../libs/logger';

type MailResults = SESTransport.SentMessageInfo | SMTPTransport.SentMessageInfo;

/**
 * Abstract class MailService
 * @abstract MailService
 */
abstract class MailService {
	protected abstract createTransporter(): Transporter<MailResults>;

	protected static onRejectedHandler(
		result: MailResults,
		mailInput: IEMailInput
	): void {
		if (result.rejected.length > 0) {
			result.rejected.forEach((address) => {
				if (typeof address === 'string') {
					logger.error(mailInput, `Email to ${address} was rejected`);
				} else {
					logger.error(mailInput, `Email to ${address.address} was rejected`);
				}
			});
		}
	}

	protected verifyTransporter(transporter: Transporter<MailResults>): boolean {
		let result: boolean = true;
		transporter.verify((err) => {
			if (err) {
				logger.error(err);
				result = false;
			}
		});
		return result;
	}

	public async sendMail(mailInput: IEMailInput): Promise<MailResults | null> {
		try {
			const transporter = this.createTransporter();
			const isReady = this.verifyTransporter(transporter);
			if (!isReady) {
				return null;
			}
			const result = await transporter.sendMail({ ...mailInput });
			const mailUrl = getTestMessageUrl(result);
			logger.debug({}, 'Preview URL: ', mailUrl);
			MailService.onRejectedHandler(result, mailInput);
			return result;
		} catch (error) {
			logger.error(error);
			return null;
		}
	}
}

export default MailService;
