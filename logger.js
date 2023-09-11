const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const moment = require('moment-timezone');

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp({
            format: () => moment().tz('America/Caracas').format('YYYY-MM-DD HH:mm:ss')
        }),
        myFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                timestamp({
                    format: () => moment().tz('America/Caracas').format('YYYY-MM-DD HH:mm:ss')
                }),
                myFormat
            )
        }),
        new transports.File({
            filename: 'logs/app.log',
            format: combine(
                timestamp({
                    format: () => moment().tz('America/Caracas').format('YYYY-MM-DD HH:mm:ss')
                }),
                myFormat
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

module.exports = logger;