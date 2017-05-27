`npm install --save easy-backblaze`

Easy Backblaze is designed to be the absolute simplest way possible to make Backblaze B2 API calls. It sports a redesigned API that makes it so you don't have to find an upload URL yourself.

``` javascript
var B2 = require('backblaze-easy');
var b2 = new B2(accountId, applicationKey);
b2.uploadFile(file, {bucketId: 'swooty', fileName:'swiggity-swooty.mp4'}, function(err, res) {
    console.log(err, res);
});
```

## Documentation of the API

``` javascript
B2#uploadFile(file, options, callback)
```

- `file` [ *Buffer* ] File to be uploaded, can be a String pointing to a directory, or a Buffer of a file already read.
- `options` [ *Object* ] | Options for the upload, can include properties `bucketId` to direct an upload to a specific bucket, and `fileName` which will name the file for download.
- `callback` [ *Function* ] Node-style callback invoked with (`err`, `res`)

``` javascript
B2#listBuckets(file, options, callback)
```
