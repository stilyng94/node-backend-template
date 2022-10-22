import { IEmailObj } from '../interfaces/mail-interfaces';
import EtherealMailService from '../service/mail/ethereal-mail-service';

const sendMail = async (
	emailObj: IEmailObj,
	template: string,
	ctx: Record<string, unknown>
) => {
	const mailService = new EtherealMailService();
	const generatedHtml = `${template} ${ctx}`;
	await mailService.sendMail({ ...emailObj, html: generatedHtml });
};

export default { sendMail };
