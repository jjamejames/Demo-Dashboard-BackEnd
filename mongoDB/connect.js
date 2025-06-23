// ทำการ connect with MongoDB


const mongoose = require('mongoose')

exports.connectDB = async (url) => {
    mongoose.set("strictQuery", true)
    mongoose.connect(url).then(() => {
        return console.log("MongoDB is running")
    }).catch((error) => {
        console.log(error)
    })
}
