const crypto = require('crypto');
const fs = require('fs');

module.exports = {
	fileSha: function(fileName, done) {
		fs.readFile(fileName, (err, data) => {
			if (err) {
				return done(err);
			}
			return done(null, crypto.createHash('sha256').update(data).digest('hex'));
		});
	},

	moveFile: function(inPath, outPath, done) {
		let readStream = fs.createReadStream(inPath);
		let writeStream = fs.createWriteStream(outPath);

		readStream.on('error', done);
		writeStream.on('error', done);

		readStream.on('close', function() {
			fs.unlink(inPath, done);
		});

		readStream.pipe(writeStream);
	},

	sendErr: function(res, err, code) {
		err = err ? err : null;
		code = code ? code : 500;
		res.status(code);
		return res.json({
			success: false,
			err: err
		});
	}
}
