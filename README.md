Easy Backblaze is designed to be the simplest way possible to make Backblaze B2 API calls. It sports a redesigned API that greatly simplifies how files are uploaded.

``` javascript
var B2 = require('backblaze-easy');
var b2 = new B2(accountId, applicationKey);
b2.upload('swiggity-swooty.mp4', function(err, res) {
    console.log(err, res);
});
```

## Create B2 Client Instance


## Methods
``` javascript 
b2.upload(String bucketId, String fileName, Buffer fileBuffer, [Function callback]);
```

## Example

Reads "swiggity-swooty.mp4" to a buffer, uploads to Backblaze, and logs the result:

``` javascript
fs.readFile('swiggity-swooty.mp4', function(fileBuffer) {
    b2.upload('gefb39f44d657ca391r', fileName, fileBuffer, function(err, res) {
        if (err) {
            console.log('Failed:', err);
        } else {
            console.log('It worked:', res);
        }
    });
});
```
