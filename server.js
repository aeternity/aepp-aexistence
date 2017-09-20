const express = require('express');
const app = express();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const tools = require('./tools');
const path = require('path');
const async = require('async');
const fs = require('fs');

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/upload', multipartMiddleware, function(req, res) {
	console.log(req.body, req.files);
	if (!req.files.file) {
		return tools.sendErr(res);
	}
	let file = req.files.file;
	async.waterfall([
		function(callback) {
			tools.fileSha(file.path, (err, hash) => {
				return callback(err, hash);
			});
		},
		function(hash, callback) {
			let newPath = path.join(__dirname, '/uploads', hash);
			tools.moveFile(file.path, newPath, (err, data) => {
				return callback(err, hash);
			});
		}
	], function(err, result) {
		if (err) {
			return tools.sendErr(res, err);
		}
		return res.json({
			success: true,
			hash: result
		});
	});
	//TODO: don't forget to delete all req.files when done
});

app.post('/hash', multipartMiddleware, function(req, res) {
	if (!req.files.file) {
		return tools.sendErr(res);
	}
	let file = req.files.file;
	tools.fileSha(file.path, (err, hash) => {
		if (err) {
			return tools.sendErr(res, err);
		}
		fs.unlink(file.path);
		return res.json({
			success: true,
			hash: hash
		});
	});
});

app.use(express.static('dist'));
app.use('/uploads', express.static(__dirname + '/uploads'));

let port = 3000;
app.listen(port, function () {
	console.log('Example app listening on port', port);
});
