var crypto = require('crypto');
var request = require('request');

function sha1(data) {
	var hasher = crypto.createHash('sha1');
	hasher.update(data);
	return hasher.digest('hex');
}

function requestJSON(url, options, callback) {
	return request(url, options, function(err, res, data) {
		if (typeof data == 'string') data = JSON.parse(data);
		
		console.log('REQUEST --------')
		console.log(url);
		console.log('----------------')
		console.log(data);
		if (err) return callback(err);
		if (res.statusCode != 200) {
			console.error('Server Error:', data);
			return callback(new Error(data.code, data.message));
		}
		callback(null, data);
	});
}

module.exports = {
	authorizeAccount(auth, callback) {
		requestJSON('https://api.backblazeb2.com/b2api/v1/b2_authorize_account', {
			'method': 'GET',
			'json': true,
			'auth': auth,
		}, callback);
	},
	listBuckets(settings, callback) {
		requestJSON(`${settings.apiUrl}/b2api/v1/b2_list_buckets`, {
			'method': 'POST',
			'json': true,
			'body': {'accountId': settings.accountId},
			'headers': {'Authorization': settings.authorizationToken},
		}, callback);
	},
	getUploadUrl(settings, bucketId, callback) {
		requestJSON(`${settings.apiUrl}/b2api/v1/b2_get_upload_url`, {
			'method': 'POST',
			'json': true,
			'body': {'bucketId': bucketId},
			'headers': {'Authorization': settings.authorizationToken}
		}, callback);
	},
	uploadFile(uploadUrl, fileBuffer, fileName = '', callback) {
		fileName = fileName.split('/').map(encodeURIComponent).join('/'); // URL safe filename
		const fileHash = sha1(fileBuffer);
		requestJSON(uploadUrl.uploadUrl, {
			'method': 'POST',
			'headers': {
				'Authorization': uploadUrl.authorizationToken,
				'Content-Type': 'b2/x-auto',
				'Content-Length': fileBuffer.byteLength,
				'X-Bz-File-Name': fileName || fileHash,
				'X-Bz-Content-Sha1': fileHash,
			},
			'body': fileBuffer,
		}, callback);
	}
};

