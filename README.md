# node-backend-template

## Jobs


- Set env `CRON_JOB=true` if you add cronjob so it validates and parse data


- Sample
  `	[
  {
		"name": "custom-template-demo",
		"module": "demo",
		"description": "",
		"parameters": {
			"parameter": [
				{
					"@name": "Age",
					"@type": "number",
					"@required": true,
					"description": "User's age"
				},
				{
					"@name": "Username",
					"@type": "string",
					"@required": true,
					"description": "username"
				},
        {
					"@name": "Consent",
					"@type": "boolean",
					"@required": false,
					"description": "consent",
          "default-value": false
				},
				{
					"@name": "Gender",
					"@type": "string",
					"@required": false,
					"@trim": true,
					"enum-values": {
						"value": ["Male", "Female", "None"]
					},
					"description": "Gender",
					"default-value": "None"
				}
			]
		},
		"status-codes": {
			"status": [
				{
					"@code": "ERROR",
					"description": "Used when an error occurred."
				},
				{
					"@code": "OK",
					"description": "Used when everything went well."
				}
			]
		}
	}
]
`

### Add configured jobs to jobs.json, followed by its implementation in jobsteps/__filename.ts. __filename is must be the same as module in job.json file.

## SESSION OR JWT

- Set env `USE_SESSION=false` to use JWT or `USE_SESSION=true` to use session and cookie authentication

## Environment Variables

- Environment variables are to be added to `config.ts` for ease of use in project.
