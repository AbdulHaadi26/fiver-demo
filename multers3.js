const { v4: uuidv4 } = require('uuid');

let aws = require('aws-sdk'),
    multer = require('multer'),
    multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: process.env.S3SECRET,
    accessKeyId: process.env.S3ID,
    region: 'us-east-2'
});

var s3 = new aws.S3();

var uploadFile = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = `${uuidv4()}${file.originalname.toLowerCase().split(' ').join('-')}`;
            cb(null, `app/files/${fileName}`);
        }
    })
});

module.exports = {
    uploadFile: uploadFile
}