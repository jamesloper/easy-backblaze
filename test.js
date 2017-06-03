var fs = require('fs');
var B2 = require('./index');
var async = require('async');

var b2 = new B2('eb9425467a94', '001db5de798446f050d618494b8f23afaf89a1fa4a', {bucket:'swiggity'});

var id = '/Users/james/Pictures/demo';

fs.readdir(id, function(err, files) {
	if (err) return console.error(err);
	
	files = files.filter(r => r.charAt(0) != '.');
	
	console.log('Going up:', files);
	
	async.mapLimit(files, 999, function(fileName, callback) {
		console.log('Beginning Upload:', fileName);
		b2.uploadFile({
			'file': `${id}/${fileName}`,
		}, function(err, uploadUrl) {
			if (err) {
				console.error('Failed:', err);
			} else {
				console.log('Upload Success:', uploadUrl);
			}
			callback(err, uploadUrl);
		});
	}, function(err, uploadUrls) {
		console.log('Done! Result:');
		console.log(err, uploadUrls);
	});
});