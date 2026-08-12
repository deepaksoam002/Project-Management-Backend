import express, { response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import morgan from "morgan";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";


const app = express();

// basic configurations
app.use(helmet());
app.use(express.json({ limit:"16kb" }));
app.use(express.urlencoded({ extended: true, limit:"16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(rateLimiter({ windowMs: 10 * 60 * 1000, max: 100}))




const morganFormat = ':method :url :status :response-time ms'

app.use(morgan(morganFormat,{
    stream: {
        write: (message) =>{
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2],
                responseTime: message.split(' ')[3],
            };
            logger.info(JSON.stringify(logObject));
        }
    }
}))

// CORS configurations 

app.use(cors({
    origin:process.env.ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"]
}));



// import routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.router.js";



app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects",projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);



import {globalErrorHandler} from "./middlewares/error.middlewares.js"

app.use(globalErrorHandler)


export default app;
