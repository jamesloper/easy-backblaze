`npm install --save easy-backblaze`

A simpler re-imagination of the Backblaze API. Upload a file in **one** call, just like in S3! Because of the depth and complexity of simply uploading, for now, this package will focus only on uploading a file. 

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

## Encrypt

To upload a file and encrypt it with a password, via `aes-256-ctr`:

``` javascript
b2.uploadFile({
    file: '/var/tmp/test.mp4', // Required, just a path to a file
    password: 'ggf96fjo' // Password
    bucket: 'swooty' // Optional, a bucketName, uploads to first bucket by default
}, function(err, res) {
    console.log('Done!', err, res);
});
```

To decrypt a file, pipe the stream through the decipher and then to the output:

``` javascript
var decryptor = crypto.createDecipher('aes-256-ctr', 'ggf96fjo');
var input = fs.createReadStream('test.mp4');
var output = fs.createWriteStream('output.mp4');
input.pipe(decryptor).pipe(output);
```

You can also decrypt using a buffer:

``` javascript
function decrypt(buffer){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
    return dec;
}
```


## Specify Bucket Up Front
``` javascript
var b2 = new B2('account_id', 'application_key', {bucket: 'swooty'});
b2.uploadFile({
    file: '/var/tmp/test.mp4'
}, function(err, res) {
    console.log('Done!', err, res);
});
```
