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
