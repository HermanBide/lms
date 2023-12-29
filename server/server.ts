import { app } from './app'
import { connectDB } from './utils/db'

require("dotenv").config

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectDB()
}) 

