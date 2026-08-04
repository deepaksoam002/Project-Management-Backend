import express from "express";
import cors from "cors";



const app = express();



app.get("/", (req, res) => {
    return res.status(200).json({message : "hello from server"})
})


export default app;
