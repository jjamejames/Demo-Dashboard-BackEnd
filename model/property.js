const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    propertyType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
})

const propertyModel = mongoose.model("Property", propertySchema)

module.exports = propertyModel