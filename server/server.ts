import { app } from './app'
import { connectDB } from './utils/db'
import dotenv from "dotenv"
dotenv.config()
// require("dotenv").config()

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectDB()
}) 

