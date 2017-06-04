`npm install --save easy-backblaze`

Easy Backblaze is a powerful, yet simple and lightweight re-imagination of the Backblaze API. Upload a file in one call, just like in S3! Because of the depth and complexity of simply uploading, for now, this package will focus only on uploading a file. It will retry after encountering 429 (Too Many Requests), 408 (Request Timeout), 500 (Internal Error) and 503 (Service Unavailable) errors.

``` javascript
var B2 = require('easy-backblaze');
var b2 = new B2('account_id', 'application_key');

b2.uploadFile({
    file: '/var/tmp/test.mp4', // Required, just a path to a file
    name: 'swiggity-swooty.mp4' // Optional, can override the file name
    bucket: 'swooty' // Optional, a bucketName, uploads to first bucket by default
}, function(err, res) {
    console.log('Done!', err, res);
});

// res = https://f001.backblazeb2.com/file/swooty/swiggity-swooty.mp4
```

## Using AES-256 Based Encryption

To upload a file and encrypt it, add a **password**:

``` javascript
b2.uploadFile({
    file: '/var/tmp/test.mp4',
    password: 'ggf96fjo'
    name: 'secretFileName.mp4' // Optional, file will be given a random string by default (recommended)
}, function(err, res) {
    console.log('Done!', err, res);
});
```

To decrypt, download and pipe the stream through the **decipher**:

``` javascript
var decryptor = crypto.createDecipher('aes-256-ctr', 'ggf96fjo');
var input = fs.createReadStream('test.mp4');
var output = fs.createWriteStream('output.mp4');
input.pipe(decryptor).pipe(output);
```

## Additional Options

An additional **options** argument can be used to specify a default bucket for uploads. 

``` javascript
var b2 = new B2('account_id', 'application_key', {bucket: 'swooty'});
b2.uploadFile({
    file: '/var/tmp/test.mp4'
}, function(err, res) {
    console.log('Done!', err, res);
});
```