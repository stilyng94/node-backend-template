import { checkSchema } from 'express-validator';

const updateDocumentTitleValidator = checkSchema(
	{
		title: {
			isString: {},
			isLength: { options: { max: 256 } },
		},
		id: {
			isString: {},
		},
	},
	['body']
);

export default { updateDocumentTitleValidator };
