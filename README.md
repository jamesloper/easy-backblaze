`npm install --save easy-backblaze`

A simpler reimagination of the Backblaze API. Takes care of the auth and fetching of the upload URL, eases bucket selection, and exposes all this as one easy API call.

Because of the depth and complexity of simply uploading, for now, this package will focus on uploading only. Please feel free to PR this on GitHub.

``` javascript
var B2 = require('backblaze-easy');
var b2 = new B2(accountId, applicationKey);
b2.uploadFile({
    file: fileBuffer,
    bucket: 'swooty',
    name:'swiggity-swooty.mp4'
}, function(err, res) {
    console.log(err, res);
});
```

## Built-in Methods

``` javascript
B2#uploadFile(options, callback)
```
Uploads a file from a Buffer, using a chosen file name and bucket.

- `file` [ *Buffer* ] File to be uploaded, can be a String pointing to a directory, or a Buffer of a file already read.
- `options` [ *Object* ] | Options for the upload, can include properties `bucket` which can be a bucketName or bucketId, and `name` which will name the file for download.
- `callback` [ *Function* ] Node-style callback `callback(err, res)`

``` javascript
B2#listBuckets(callback)
```
Gets the bucket details from the server and invokes `callback(err, buckets)` with an array of buckets.
