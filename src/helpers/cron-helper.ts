export default class CronHelper {
	private static instance: CronHelper;

	private constructor() {}

	static getInstance(): CronHelper {
		if (!CronHelper.instance) {
			CronHelper.instance = new CronHelper();
		}
		return CronHelper.instance;
	}
}
