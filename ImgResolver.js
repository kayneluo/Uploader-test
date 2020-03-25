const ENV = process.env;
const URL = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const staticServer = require('node-static');

const logHandler = require('./LogHandler');

const RESOURCE_ROOT = ENV.RESOURCE_PATH

class ImgResolver {

    constructor() {
        this._fileServer = new staticServer.Server(RESOURCE_ROOT, {
            cache: null,
            gzip: true
        });
    }

    _getImagePath(isAbsolutePath, needWebp, pathInfo) {
        return path.join(
            isAbsolutePath ? RESOURCE_ROOT : '',
            pathInfo.dir,
            pathInfo.name + pathInfo.ext + (needWebp ? '.webp' : '')
        );
    };

    run() {
        const hostname = ENV.LOCAL ? '127.0.0.1' : null;

        http.createServer((req, res) => {
            req.addListener('end', () => {
                const url = URL.parse(req.url);

                const pathInfo = path.parse(url.pathname);

                if (!pathInfo.name) {
                    logHandler.error(`URL: ${req.url} is illegal.`);
                    res.statusCode = 404;
                    res.end();
                    return;
                }

                const fullWebpFilePath = this._getImagePath(true, true, pathInfo);
                const relativeWebpFilePath = this._getImagePath(false, true, pathInfo);
                const fullNormalFilePath = this._getImagePath(true, false, pathInfo);
                const relativeNormalFilePath = this._getImagePath(false, false, pathInfo);

                const accepts = req.headers['accept'];
                logHandler.info(`Target File Path: ${fullNormalFilePath}`);

                if (accepts && accepts.indexOf('image/webp') !== -1 && fs.existsSync(fullWebpFilePath)) {
                    logHandler.info(`URL: ${req.url} Accepts: ${accepts} send webp`);
                    this._fileServer.serveFile(relativeWebpFilePath, 200, { 'Content-Type': 'image/webp' }, req, res);
                } else if (fs.existsSync(fullNormalFilePath)) {
                    logHandler.info(`URL: ${req.url} Accepts: ${accepts} send normal`);
                    this._fileServer.serveFile(relativeNormalFilePath, 200, {}, req, res);
                } else {
                    logHandler.error(`URL: ${req.url} Accepts: ${accepts} file not found, send nothing`);
                    res.statusCode = 404;
                    res.end();
                }
            }).resume();
        }).listen(ENV.IMGRESOLVER_PORT, hostname, (err) => {
            if (err) {
                logHandler.error(err)
            } else {
                logHandler.info(`ImgResolver on port: ${port}`);
            }
        });
    }
}

module.exports = ImgResolver;