import EtherealMailService from '../mail/ethereal-mail-service';

describe('Testing sending mail with Ethereal Mail Service', () => {
	const service = new EtherealMailService();

	test('should be successful', async () => {
		const result = await service.sendMail({
			from: 'from@mail.com',
			subject: 'Test Ethereal Subject',
			to: ['to@mail.com'],
			text: 'Testing Ethereal mailing',
		});
		expect(result).toHaveProperty('messageId');
	});
});
