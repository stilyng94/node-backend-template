# node-backend-template

## Jobs

- With Args
  `	{
	"name": "demo-cron",
	"data": [
		{
			"type": "string",
			"key": "username",
			"description": "The username"
		}
	]
}`

- Without Args
  `	{
	"name": "demo-cron",
	"data": []
}`

### Add pre-configured jobs to src/resources/jobs.json, followed by its implementation in worker-processor.ts file.

## SESSION OR JWT

- Set env `USE_SESSION=false` to use JWT or `USE_SESSION=true` to use session and cookie authentication

## Environment Variables

- Environment variables are to be added to `config.ts` for ease of use in project.
