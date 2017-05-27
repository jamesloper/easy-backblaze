`npm install --save easy-backblaze`

A simpler reimagination of the Backblaze API. Upload a file in **one** call, just like in S3! Because of the depth and complexity of simply uploading, for now, this package will focus only on uploading. 

Backblaze, feel free to PR!

## Setup
``` javascript
var B2 = require('backblaze-easy');
var b2 = new B2('account_id', 'application_key');
```

## Upload
Uploads a file from a Buffer, optionally specify a file name and bucket:

``` javascript
b2.uploadFile({
    file: fileBuffer, // Buffer of a file, the result of fs.readFile()
    bucket: 'swooty', // Optional, an ID or name, defaults is the first bucket
    name: 'swiggity-swooty.mp4' // Optional, defaults to sha1 hash of file
}, function(err, res) {
    console.log('Done!', err, res);
});

// res = https://f001.backblazeb2.com/file/swooty/swiggity-swooty.mp4
```

## List Buckets
Lists buckets associated with an account, in alphabetical order by ID.

``` javascript
b2.listBuckets(function(err, res) {
	if (err) return console.error('Error:', err);
	console.log('Success:', res);
});

// Calls back with an array of buckets:
// res = [ { _id: '0e3b89d4e2e524c657ca0914', name: 'swooty' } ]
```
