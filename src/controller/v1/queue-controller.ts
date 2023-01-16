import { NextFunction, Request, Response } from 'express';
import queue from '@/libs/queue';
import jsonJobs from '@/resources/job.json';

async function getAllJobs(req: Request, res: Response, next: NextFunction) {
	try {
		const jobs = await queue.getJobs(['completed', 'failed', 'active']);
		return res.status(200).json(jobs);
	} catch (error) {
		return next(error);
	}
}

async function getAllCronJobs(req: Request, res: Response, next: NextFunction) {
	try {
		const jobs = await queue.getRepeatableJobs();
		return res.status(200).json(jobs);
	} catch (error) {
		return next(error);
	}
}

async function retryFailedJob(req: Request, res: Response, next: NextFunction) {
	try {
		const job = await queue.getJob(req.params.jobId);
		await job?.retry();
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

async function deleteCronJob(req: Request, res: Response, next: NextFunction) {
	try {
		const { jobKey } = req.body;
		await queue.removeRepeatableByKey(jobKey);
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

async function deleteJob(req: Request, res: Response, next: NextFunction) {
	try {
		await queue.remove(req.params.jobId);
		return res.sendStatus(200);
	} catch (error) {
		return next(error);
	}
}

async function addCronJob(req: Request, res: Response, next: NextFunction) {
	try {
		const {
			jobId,
			jobName,
			pattern,
			jobData,
			startDate,
			endDate,
			delay,
			limit,
			every,
		} = req.body;
		const job = await queue.add(jobName, jobData, {
			jobId,
			delay: delay ?? 0,
			repeat: { pattern, utc: true, startDate, endDate, limit, every },
		});
		return res.status(200).json(job);
	} catch (error) {
		return next(error);
	}
}

async function getConfigJobs(req: Request, res: Response, next: NextFunction) {
	try {
		return res.status(200).json(jsonJobs);
	} catch (error) {
		return next(error);
	}
}

export default {
	getAllJobs,
	retryFailedJob,
	getAllCronJobs,
	deleteCronJob,
	deleteJob,
	addCronJob,
	getConfigJobs,
};
