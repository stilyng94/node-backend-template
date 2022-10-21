module.exports = {
	apps: [
		{
			name: 'api',
			script: './dist/index.js',
			autorestart: true,
			instances: 'max',
			exec_mode: 'cluster',
			instance_var: 'INSTANCE_ID',
		},
	],
};
