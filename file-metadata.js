'use strict';

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

exports.create = function()
{
	const router = require('express').Router();
	router.post('/', upload.single('upfile'), (req, res) => {
		res.json({
			'name' : req.file.originalname,
			'type' : req.file.mimetype,
			'size' : req.file.size
		});
	});
	return router;
}
