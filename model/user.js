const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    allProperties: { type: mongoose.Schema.Types.ObjectId, ref, ref: "Property" }
})

const useryModel = mongoose.Model("User", userSchema)

module.exports = useryModel