var crypto = require('crypto');
var https = require('https');
var request = require('request');

function sha1(data) {
	var generator = crypto.createHash('sha1');
	generator.update(data);
	return generator.digest('hex');
}

function requestJSON(opts, callback) {
	opts.json = true;
	
	var req = request(opts, function(err, res, data) {		
		if (err) {
			callback(err);
		} else if (res.statusCode != 200) {
			console.error(data);
			callback(new Error(data.code, data.message));
		} else {
			callback(null, data);
		}
	});
	return req;
}

class B2 {
	constructor(accountId, applicationKey) {
		this.props = {
			auth: {user:accountId, password:applicationKey},
			buckets: [],
			settings: null,
		};
	}
	
	init(callback) {
		var { auth, settings, buckets } = this.props;
		if (settings) return callback();

		requestJSON({
			'method': 'GET',
			'url': 'https://api.backblazeb2.com/b2api/v1/b2_authorize_account',
			'auth': auth,
		}, (err, data) => {
			if (err) {
				callback(err);
			} else {
				this.props.settings = data;
				callback();
			}
		});
	}
	
	listBuckets(callback) {
		this.init(err => {
			if (err) return callback(err);

			var { auth, settings, buckets } = this.props;
						
			requestJSON({
				'method': 'POST',
				'url': `${settings.apiUrl}/b2api/v1/b2_list_buckets`,
				'body': {'accountId': settings.accountId},
				'headers': {
					'Authorization': settings.authorizationToken,
				}
			}, (err, data) => {
				if (err) {
					callback(err);
				} else {				
					var { buckets } = data;
					if (!buckets || buckets.length == 0) {
						callback(new Error(404, 'No buckets found, please create one', data));
					} else {
						this.props.buckets = buckets;
						callback(null, buckets);
					}
					
				}
			});
		});
	}
	
	uploadFile(fileBuffer, opts = {}, callback) {
		if (!fileBuffer instanceof Buffer) throw new Error(500, 'First paramater <fileBuffer> needs to ba a buffer!');
		if (!opts instanceof Object) throw new Error(500, 'Second paramater <opts> needs to ba an object!');
		if (!callback instanceof Function) throw new Error(500, 'Third paramater <callback> needs to ba a function!');
		
		this.listBuckets(err => {
			if (err) return callback(err);

			const { settings, auth, buckets } = this.props;
						
			const fileHash = sha1(fileBuffer);
						
			opts = Object.assign({
				fileName: fileHash,
				bucketId: buckets[0].bucketId,
			}, opts);
						
			requestJSON({
				'method': 'POST',
				'url': `${settings.apiUrl}/b2api/v1/b2_get_upload_url`,
				'body': {'bucketId': opts.bucketId},
				'headers': {
					'Authorization': settings.authorizationToken,
				}
			}, function(err, res) {
				if (err) {
					callback(err);
				} else {
					var req = requestJSON({
						'method': 'POST',
						'url': res.uploadUrl,
						'headers': {
							'Authorization': res.authorizationToken,
							'Content-Type': 'b2/x-auto',
							'X-Bz-File-Name': opts.fileName,
							'X-Bz-Content-Sha1': fileHash,
						},
						'body': fileBuffer.toString(),
					}, function(err, data) {
						if (err) {
							callback(err);							
						} else {
							console.log('UPLOAD RESULT:', data);
							callback(null, err);							
						}
					});
				}
			});
		});
	}
}

module.exports = B2;