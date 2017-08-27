var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var api = require('./api');
var EventEmitter = require('events');

class B2 {
	constructor(user, password, config = {}) {
		this._auth = [user, password].join(':');
		this._config = Object.assign({connections: 4, bucket: null}, config);
		this._init = {expires: 0};
	}

	init(callback) {
		// If initted in the last two minutes don't bother initing again
		if (Date.now() < this._init.expires)
			return callback(null, this._init);

		api.authorizeAccount(this._auth, (err, settings) => {
			if (err) return callback(err);

			api.listBuckets(settings, (err, data) => {
				if (err) return callback(err);
				if (data.buckets.length === 0) return callback(new Error('No buckets in account'));

				this._init = {'buckets': data.buckets, 'settings': settings, 'expires': Date.now() + 120000};
				callback(null, this._init);
			});
		});
	}

	uploadFile(file, options) {
		var emitter = new EventEmitter();
		var args = [...arguments];

		var callback = function() {
		};
		if (args[args.length - 1] instanceof Function) {
			callback = args.pop();
			if (args.length === 1) options = {};
		}

		// console.log('Upload file options are:', options);

		if (options.name && !options.name instanceof String) throw new Error('Name must be a string');
		if (options.bucket && !options.bucket instanceof String) throw new Error('Bucket must be a string');
		if (options.password && !options.password instanceof String) throw new Error('Password must be a string');

		var uploadBuffer = (fileBuffer) => {
			this.init((err, context) => {
				if (err) return callback(err);

				// Pick the proper bucket based on defaults and user preference
				let bucket = context.buckets[0];
				options.bucket = options.bucket || this._config.bucket;
				if (options.bucket) {
					bucket = context.buckets.find(r => r.bucketName == options.bucket);
					if (!bucket) throw new Error(`bucket ${options.bucket} could not be found`);
				}

				// If a password is specified, encrypt the file
				if (options.password) {
					var cipher = crypto.createCipher('aes-256-ctr', options.password);
					fileBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
				}

				// Get an endpoint to upload to
				api.getUploadUrl(context.settings, bucket.bucketId, (err, uploadUrl) => {
					if (err) return callback(err);

					// Upload it
					// var fileName = options.name || path.basename(options.file);
					api.uploadFile(uploadUrl, fileBuffer, options.name, (err, res) => {
						if (err) return callback(err);
						callback(null, `${context.settings.downloadUrl}/file/${bucket.bucketName}/${res.fileName}`);
					}, emitter);
				});
			});
		};

		// If file is a string, read it in to a buffer
		if (file instanceof Buffer) {
			if (options.name) {
				uploadBuffer(file);
			} else {
				callback(new Error('If using a buffer you must specify a name for your file'));
			}
		} else if (typeof file === 'string') {
			options.name = options.name || path.basename(file);
			fs.readFile(file, (err, fileBuffer) => {
				if (err) return callback(err);
				uploadBuffer(fileBuffer, options, callback);
			});
		} else {
			callback(new Error('Invalid file, must be a path or buffer'));
		}

		return emitter;
	}
}

module.exports = B2;