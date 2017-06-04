var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var backend = require('./rawbackend.js');


function randomString(length) {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

class B2 {
	constructor(user, password, config = {}) {
		this._auth = {'user': user, 'password': password};
		this._config = Object.assign({connections: 4, bucket: null}, config);
		this._init = {expires:0};
	}
	
	init(callback) {
		// If initted in the last two minutes don't bother initing again
		if (Date.now() < this._init.expires) 
			return callback(null, this._init);
		
		backend.authorizeAccount(this._auth, (err, settings) => {
			if (err) return callback(err);

			backend.listBuckets(settings, (err, data) => {
				if (err) return callback(err);
				if (data.buckets.length == 0) return callback(new Error(404, 'no buckets in account'));
				
				this._init = {'buckets': data.buckets, 'settings': settings, 'expires': Date.now() + 120000};
				callback(null, this._init);
			});
		});
	}
	
	uploadFile(options, callback) {		
		if (!options instanceof Object) throw new Error(400, 'options must be an object');
		if (!callback || !callback instanceof Function) throw new Error(400, 'no callback was passed');
		if (!options.file || !options.file instanceof String) throw new Error(400, 'file needs to be a string');
		if (options.name && !options.name instanceof String) throw new Error(400, 'name must be a string');
		if (options.bucket && !options.bucket instanceof String) throw new Error(400, 'bucket must be a string');
		if (options.password && !options.password instanceof String) throw new Error(400, 'password must be a string');
		
		this.init((err, context) => {
			if (err) return callback(err);
			
			// Pick the proper bucket based on defaults and user preference
			let bucket = context.buckets[0];
			let preferredBucket = options.bucket || this._config.bucket;
			if (preferredBucket) {
				bucket = context.buckets.find(r => r.bucketName == preferredBucket);
				if (!bucket) throw new Error(404, `bucket ${options.bucket} could not be found`);
			}
			
			// Buffer the target file into memory
			fs.readFile(options.file, (err, fileBuffer) => {
				if (err) return callback(err);
				
				// If a password is specified, encrypt the file
				if (options.password) {
					var cipher = crypto.createCipher('aes-256-ctr', options.password);
					fileBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
					if (!options.name) options.name = randomString(17);
				}
				
				// Get an endpoint to upload to
				backend.getUploadUrl(context.settings, bucket.bucketId, (err, uploadUrl) => {
					if (err) return callback(err);
					
					// Upload it
					var fileName = options.name || path.basename(options.file);
					backend.uploadFile(uploadUrl, fileBuffer, fileName, (err, res) => {
						if (err) return callback(err);
						callback(null, `${context.settings.downloadUrl}/file/${bucket.bucketName}/${res.fileName}`);
					});
				});
			});
		});
	}
}

module.exports = B2;