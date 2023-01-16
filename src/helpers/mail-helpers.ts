import ejs from 'ejs';
import path from 'path';
import logger from '@/libs/logger';
import EtherealMailService from '@/service/mail/ethereal-mail-service';
import { IBaseEmailInput } from '@/interfaces/mail-interfaces';

const getRenderedTemplate = async (
	template: string,
	ctx: Record<string, unknown>
): Promise<string> => {
	return ejs.renderFile(
		path.join('views', 'mail-template', `${template}.ejs`),
		ctx,
		{
			beautify: false,
			async: true,
		}
	);
};

const sendMail = async (
	emailObj: IBaseEmailInput,
	template: string,
	ctx: Record<string, unknown>
) => {
	try {
		const mailService = new EtherealMailService();
		const generatedHtml = await getRenderedTemplate(template, ctx);

		await mailService.sendMail({ ...emailObj, html: generatedHtml });
	} catch (error) {
		logger.error(error);
	}
};

const sendPromotionalMail = async (
	emailObj: IBaseEmailInput,
	template: string,
	unsubscribeUrl: string,
	ctx: Record<string, unknown>,
	description?: string
) => {
	try {
		const mailService = new EtherealMailService();
		const generatedHtml = await getRenderedTemplate(template, ctx);

		await mailService.sendPromotionalMail({
			...emailObj,
			html: generatedHtml,
			list: {
				Unsubscribe: {
					url: unsubscribeUrl,
					comment: description ?? 'Unsubscribe',
				},
			},
		});
	} catch (error) {
		logger.error(error);
	}
};

export default { sendMail, sendPromotionalMail };
