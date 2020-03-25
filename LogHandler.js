const enabled = process.env.isProduction === true
const getTime = () => new Date().toString()
const record = (log) => {
    console.log(log)
    // or send to log system
}

const logHandler = {
    
    info(log) {
        if (!enabled) {
            return
        }
        record(`INFO: ${log} at ${getTime()}`)
    },

    error(log) {
        if (!enabled) {
            return
        }
        record(`ERROR: ${log} at ${getTime()}`)
    }
};

module.exports = logHandler