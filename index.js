const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const app = express()
const connect = require('./mongoDB/connect')
const userRouter = require('./routes/user.routes')
const propertyRouter = require('./routes/property.routes')


const port = process.env.PORT || 8080
dotenv.config({ path: './config.env' })

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use('/api/v1/users',userRouter)
app.use('/api/v1/properties',propertyRouter)


app.get('/', (req, res) => { 
    res.send('Hello') 
})

const startServer = async () => {
    try {
        connect.connectDB(process.env.MONGODB_URL)
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}
startServer()