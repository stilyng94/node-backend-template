import ejs from 'ejs';
import path from 'path';
import { IEmailObj } from '../interfaces/mail-interfaces';
import logger from '../libs/logger';
import EtherealMailService from '../service/mail/ethereal-mail-service';

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
	emailObj: IEmailObj,
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

export default { sendMail };
