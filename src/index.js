import server from "./app.js"
import dotenv from "dotenv";
dotenv.config({
    path : "./.env"
})

const PORT = process.env.PORT || 8005;




server.listen(PORT, () => {
    console.log('Server is running successfully on port :', PORT)
    console.log(`Follow Link:  http://localhost:${PORT}`);
})