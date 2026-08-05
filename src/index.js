import server from "./app.js"
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path : "./.env"
})

const PORT = process.env.PORT || 8005;




connectDB()
.then( () => {

    server.listen(PORT, () => {
    console.log('Server is running successfully on port :', PORT)
    console.log(`Follow Link:  http://localhost:${PORT}`);
})

})
.catch((err) => {
    console.error("MongoDB connection error",err);
    process.exit(1);
})