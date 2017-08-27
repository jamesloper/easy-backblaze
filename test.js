var fs = require('fs');
var B2 = require('./index');
var async = require('async');

var b2 = new B2('eb9425467a94', '0010d7bafeae88e5847999f35a7dcc8c1fd29566f9', {bucket: 'swiggity'});

var path = '/Users/james/Music/iTunes/iTunes Media/Music/Mingo/Swooty';
fs.readdirSync(path).forEach(function(filePath) {
	if (filePath.slice(0, 1) === '.') return;

	console.log(filePath);

	b2.uploadFile(`${path}/${filePath}`, function(err, uploadUrl) {
		if (err) {
			console.error('Failed:', err.message);
		} else {
			console.log('Upload Success:', uploadUrl);
		}
	});
});


// Single large file
// var handle = b2.uploadFile('/Users/james/Documents/Poontunes/commercial.mp4', function(err, uploadUrl) {
// 	if (err) {
// 		console.error('Failed:', err.message);
// 	} else {
// 		console.log('Upload Success:', uploadUrl);
// 	}
// });
//
// handle.on('progress', function(progress) {
// 	console.log('progress:', progress);
// });
