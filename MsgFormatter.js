class MsgFormatter {
    static getResult(code, data, msg) {
        return {
            status: code,
            data: data,
            msg: msg
        };
    }

    static getError(errCode, msg) {
        return MsgFormatter.getResult(errCode, null, msg);
    }

    static getSuccess(data, msg) {
        return MsgFormatter.getResult(0, data, msg);
    }
}

module.exports.MsgFormatter = MsgFormatter;