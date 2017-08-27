var crypto = require('crypto');
var https = require('https');
var url = require('url');
const EventEmitter = require('events');

function sha1(data) {
	var hasher = crypto.createHash('sha1');
	hasher.update(data);
	return hasher.digest('hex');
}

function request(options, callback, emitter) {
	if (options.body) options.headers['content-length'] = options.body.length;
	var retryCount = 0;

	function call() {
		retryCount++;
		var req = https.request(options, function(res) {
			var data = '';
			res.on('data', a => data += a);

			res.on('end', function() {
				if (typeof res.headers['content-type'].includes('application/json')) data = JSON.parse(data);

				switch (res.statusCode) {
					case 429: // TOO MANY REQUESTS
						var wait = (retryCount * 30);
						console.warn(`B2: ${res.statusCode} ${data.code}, will retry in ${wait}s`);
						setTimeout(call, wait * 1000);
						break;
					case 408: // REQUEST TIMEOUT
					case 500: // INTERNAL ERROR
					case 503: // SERVICE UNAVAILABLE
						var wait = (retryCount * 2);
						console.warn(`B2: ${res.statusCode} ${data.code}, will retry in ${wait}s`);
						setTimeout(call, wait * 1000);
						break;
					case 200:
						callback(null, data);
						break;
					default:
						console.error('B2:', data);
						callback(data.message);
				}
			});
		});

		req.on('error', function(err) {
			console.error(`B2 problem with response: ${err.message}`);
		});

		if (options.body) {
			var startTime = Date.now(), totalBytes = options.body.length, sentBytes = 0;

			function uploadNextChunk(lastChunkSize) {
				sentBytes += lastChunkSize;

				var chunk = options.body.slice(sentBytes, sentBytes + 524288);

				if (emitter) emitter.emit('progress', {
					'sentBytes': sentBytes,
					'totalBytes': totalBytes,
					'elapsedTime': (Date.now() - startTime),
				});

				if (chunk.length > 0) {
					req.write(chunk, () => uploadNextChunk(chunk.length));
				} else {
					req.end();
				}
			}

			uploadNextChunk(0);
		} else {
			req.end();
		}
	};
	call();
}

module.exports = {
	authorizeAccount(auth, callback) {
		request({
			'hostname': 'api.backblazeb2.com',
			'path': '/b2api/v1/b2_authorize_account',
			'method': 'GET',
			'auth': auth,
		}, callback);
	},
	listBuckets(settings, callback) {
		request({
			'hostname': url.parse(settings.apiUrl).hostname,
			'path': '/b2api/v1/b2_list_buckets',
			'method': 'POST',
			'body': JSON.stringify({'accountId': settings.accountId}),
			'headers': {'Authorization': settings.authorizationToken},
		}, callback);
	},
	getUploadUrl(settings, bucketId, callback) {
		request({
			'hostname': url.parse(settings.apiUrl).hostname,
			'path': '/b2api/v1/b2_get_upload_url',
			'method': 'POST',
			'body': JSON.stringify({'bucketId': bucketId}),
			'headers': {'Authorization': settings.authorizationToken},
		}, callback);
	},
	uploadFile(uploadUrl, fileBuffer, fileName = '', callback, emitter) {
		var urlObj = url.parse(uploadUrl.uploadUrl);

		fileName = fileName.split('/').map(encodeURIComponent).join('/'); // URL safe filename
		var fileHash = sha1(fileBuffer);

		request({
			'hostname': urlObj.hostname,
			'path': urlObj.path,
			'method': 'POST',
			'headers': {
				'Authorization': uploadUrl.authorizationToken,
				'Content-Type': 'b2/x-auto',
				'Content-Length': fileBuffer.byteLength,
				'X-Bz-File-Name': fileName || fileHash,
				'X-Bz-Content-Sha1': fileHash,
			},
			'body': fileBuffer,
		}, callback, emitter);
	},
};