`npm install --save easy-backblaze`

Easy Backblaze is a powerful, yet simple and lightweight re-imagination of the Backblaze API. Upload a file in one call, just like in S3! Because of the depth and complexity of simply uploading, for now, this package will focus only on uploading a file. It will retry after encountering 429 (Too Many Requests), 408 (Request Timeout), 500 (Internal Error) and 503 (Service Unavailable) errors.

``` javascript
var B2 = require('easy-backblaze');
var b2 = new B2('account_id', 'application_key');

b2.uploadFile('/var/tmp/test.mp4', {
    name: 'swiggity-swooty.mp4' // Optional, can override the file name
    bucket: 'swooty' // Optional, a bucketName, default is the first bucket
}, function(err, res) {
    console.log('Done!', err, res);
});

// res = https://f001.backblazeb2.com/file/swooty/swiggity-swooty.mp4
```

## Get Progress Updates

``` javascript
var client = b2.uploadFile('/var/tmp/test.mp4', function(err, res) {
    console.log('Done!', err, res);
});

client.on('progress', function(progress) { // Every time 512 KB finish uploading
    console.log('Progress:', progress);
});
```


## AES-256 Encryption

To upload a file and encrypt it, just add a **password**:

``` javascript
b2.uploadFile('/var/tmp/test.mp4', {
    password: 'ggf96fjo',
    name: 'secretFileName.mp4' // Optional, file will be given a random string by default (recommended)
}, function(err, res) {
    console.log('Done!', err, res);
});
```

To decrypt, download and pipe the stream through any old compatible decipher:

``` javascript
var decipher = crypto.createDecipher('aes-256-ctr', 'ggf96fjo');
var input = fs.createReadStream('test.mp4');
var output = fs.createWriteStream('output.mp4');
input.pipe(decipher).pipe(output);
```

## Additional Options

An additional **options** argument can be used to specify a default bucket for uploads. 

``` javascript
var b2 = new B2('account_id', 'application_key', {bucket: 'swooty'});
b2.uploadFile('/var/tmp/test.mp4', function(err, res) {
    console.log('Done!', err, res);
});
```

> If you appreciate the work that went into this, donate to 15BHA6gPYszTfsbDHUag4nu6WZiQPkDoUL