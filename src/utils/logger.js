import { createLogger, format, transports} from "winston";
import { fileURLToPath} from 'url';
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {combine, timestamp, json, colorize, printf} = format;


const consoleLogFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({level, message, timestamp}) => {
        return `${timestamp}  ${level}: ${message}`;
    })
);


const logger = createLogger({
    level: 'info',
    format: combine(
       timestamp(),
       json()
    ),
    transports: [
        new transports.Console({
            format: consoleLogFormat
        }),
        new transports.File({
            filename: path.join(__dirname, "../../logs/app.log")
        })
    ],
})

export default logger;

