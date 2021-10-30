//To get process env variables
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const compression = require('compression');

//Middleware functions
app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());
app.use(compression({ filter: shouldCompress }));

var aws = require('aws-sdk');
const { uploadFile } = require('./multers3');

aws.config.update({
    secretAccessKey: process.env.S3SECRET,
    accessKeyId: process.env.S3ID,
    region: 'us-east-2',
});

var s3 = new aws.S3();

app.put('/upload', uploadFile.single('audio'), async (req, res, next) => {
    try {
        const { key } = req.file;

        let url = s3.getSignedUrl('getObject', {
            Bucket: process.env.S3BUCKET,
            Key: key,
            Expires: 604800
        });

        return res.send(url);
    } catch(e) { 
        res.json({ error: e.message });
     }
});


/*
//let baseUrl = "http://localhost"
let baseUrl = 'https://demo-fiverr.herokuapp.com';

app.put('/upload', uploadFile.single('audio'), async (req, res, next) => {
    try {
        const { key } = req.file;

        return res.send(`${baseUrl}/${key}`);
    } catch(e) { 
        res.json({ error: e.message });
     }
});

app.get('/app/files/:key', uploadFile.single('audio'), async (req, res, next) => {
    try {
        const { key } = req.params;

        let params = {
            Bucket: process.env.S3BUCKET,
            Key: `app/files/${key}`
        };

        s3.getObject(params, function (err, data) {
            if (err) {
                return res.send({ "error": err });
            }
            res.attachment('audio-recording');
            res.type(data.ContentType); 
            res.set('content-disposition','inline');
            res.send(data.Body);    
        });
    } catch(e) { 
        res.json({ error: e.message });
     }
});*/

function shouldCompress(req, res) {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
}

http.createServer(app).listen(process.env.PORT);


