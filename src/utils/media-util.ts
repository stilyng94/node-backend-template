const createFileName = (file: Express.Multer.File): string =>
	`${new Date().toISOString().replace(/:/g, '-')}-${file.originalname.replace(
		/\s+/g,
		''
	)}`;

export default { createFileName };
