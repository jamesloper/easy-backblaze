var Backend = require('./rawbackend.js');

class B2 {
	constructor(user, password) {
		this.auth = {'user': user, 'password': password};
		this.settings = {};
		this.buckets = [];
	}
	
	init(callback) {		
		Backend.authorizeAccount(this.auth, (err, settings) => {
			if (err) return callback(err);

			this.settings = settings;
			
			Backend.listBuckets(settings, (err, data) => {
				if (err) return callback(err);
				this.buckets = data.buckets;
				callback();
			});
		});
	}
	
	listBuckets(callback) {
		this.init(err => {
			if (err) return callback(err);						
			
			Backend.listBuckets(this.settings, (err, data) => {
				if (err) return callback(err);
				callback(null, data.buckets);
			});
		});
	}
	
	uploadFile(options, callback) {
		if (!options instanceof Object) 
			throw new Error(500, '<options> needs to ba an object: {*file:Buffer, bucket:String, name:String}');
		if (!callback || !callback instanceof Function) 
			throw new Error(500, 'No callback was passed');
		if (!options.file || !options.file instanceof Buffer) 
			throw new Error(500, '<options.file> needs to be a buffer!');
		if (options.name && !options.name instanceof String)
			throw new Error(500, '<options.name> must be a string!');
		if (options.bucket && !options.bucket) 
			throw new Error(404, '<options.bucket> must be a bucketId or the name of a bucket!');
		
		this.init(err => {
			if (err) return callback(err);

			let bucket = this.buckets[0];
			if (options.bucket) {
				const bucketByName = this.buckets.find(r => r.bucketName == options.bucket);
				const bucketById = this.buckets.find(r => r.bucketId == options.bucket)
				bucket = bucketByName || bucketById;
				if (!bucket) throw new Error(404, `Bucket with id or name "${options.bucket}" could not be found`);
			}
			
			Backend.getUploadUrl(this.settings, bucket.bucketId, (err, uploadUrl) => {
				if (err) return callback(err);
				
				Backend.uploadFile(uploadUrl, options.file, options.name, callback);
			});
		});
	}
}

module.exports = B2;