`npm install --save easy-backblaze`

A simpler reimagination of the Backblaze API. Upload a file in **one** call, just like in S3! Because of the depth and complexity of simply uploading, for now, this package will focus on uploading only. Please feel free to PR this on GitHub.

``` javascript
var B2 = require('backblaze-easy');

var b2 = new B2('account_id', 'application_key');

b2.uploadFile({
    'file': fileBuffer, // Perhaps the result of fs.readFile()
    'bucket': 'swooty', // Optional! A bucketId or bucketName
    'name': 'swiggity-swooty.mp4' // Optional! Defaults to sha1 hash of file
}, function(err, res) {
    console.log('Done!', err, res);
});
```

## B2#uploadFile(options, callback)

Uploads a file from a Buffer, using a chosen file name and bucket. The options are as follows:

- `file` - Buffer of a file already read.
- `bucket` - Optional, can be a bucketName or bucketId
- `name` - Optional, rename the file for storage and download.

## B2#listBuckets(callback)

Calls back with an array of buckets.
