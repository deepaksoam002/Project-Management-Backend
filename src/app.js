import express from "express";
import cors from "cors";



const app = express();

// basic configurations

app.use(express.json({ limit:"16kb" }));
app.use(express.urlencoded({ extended: true, limit:"16kb" }));
app.use(express.static("public"));


// CORS configurations 

app.use(cors({
    origin:process.env.ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"]
}));





app.get("/", (req, res) => {
    return res.status(200).json({message : "hello from server"})
})


export default app;
