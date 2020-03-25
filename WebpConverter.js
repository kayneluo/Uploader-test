const CWebp = require('cwebp').CWebp;
const logHandler = require('./LogHandler');

class WebPConverter {
    static convert(input, output) {
        const encoder = CWebp(input);
        encoder.write(output, (err) => {
            if (err) {
                logHandler.error(err);
            }
        });
    }
}

module.exports = WebPConverter;