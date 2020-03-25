const ENV = process.env;
const path = require('path');
const fs = require('fs');
const app = require('express')();
const bodyParser = require('body-parser');

const logHandler = require('./LogHandler');
const WebpConverter = require('./WebpConverter');

const msgFormatter = require('./MsgFormatter');
// const aws = require('aws-sdk');
const multer = require('multer');
// const multerS3 = require('multer-s3');
// const s3Instance = new aws.S3({
//     accessKeyId: ENV.AWS_ACCESS_KEY_ID,
//     secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY
// });

const getTempPath = () => {
    const imgDir = this.getValue(ENV.RESOURCE_PATH);
    if (!imgDir || !fs.existsSync(imgDir)) {
        return null;
    }
    const tempDir = path.join(imgDir, '.tmp/');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }
    return tempDir;
}

const upload = multer({
    dest: getTempPath(),
    
    limits: {
        fileSize: Math.ceil(1024 * 1024)
    },

    // storage: multerS3({
    //     s3: s3Instance,
    //     bucket: ENV.AWS_BUCKET,
    //     acl: 'public-read',
    //     metadata(req, file, cb) {
    //         cb(null, { fieldName: file.fieldname })
    //     },
    //     key(req, file, cb) {
    //         cb(null, Date.now().toString() + '.png')
    //     }
    // })
}).single('image');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            logHandler.error(err);
            doResponse(null, err);
            return;
        }
        let file = req.file;
        if (!file) {
            doResponse('ERROR');
            return;
        }
        let ext = path.parse(file.originalname).ext;
        let ts = (new Date() * 1);
        let fileName = `${ts}${ext}`;
        let imageFilePath = path.join(ENV.RESOURCE_PATH, fileName);
        moveFile(file.path, imageFilePath, fileName);
    });

    const moveFile = (currentPath, destPath, fileName) => {
        fs.rename(currentPath, destPath, (err) => {
            if (err) {
                logHandler.error(err);
                doResponse(null, err);
                return;
            } else {
                WebpConverter.convert(destPath, destPath + '.webp');
                doResponse({
                    fullurl: `https://localhost:8889/${fileName}`
                });
            }
        });
    };

    const doResponse = (data, err = null) => {
        if (data) {
            res.json(msgFormatter.getSuccess(data));
        } else {
            res.json(msgFormatter.getError(-1, err.message))
        }
        res.end();
    };
});

const run = () => {
    const port = ENV.PORT;
    const hostname = ENV.LOCAL ? '127.0.0.1' : null;
    
    app.listen(port, hostname, (err) => {
        if (err) {
            logHandler.error(err);
        } else {
            logHandler.info(`ImgUploader on port: ${port}`);
        }
    });
}

module.exports = {
    run
};