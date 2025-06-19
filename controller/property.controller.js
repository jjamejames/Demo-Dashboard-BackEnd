const mongoose = require('mongoose')
const dotenv = require('dotenv')
const propertyModel = require("../model/property")
const userModel = require("../model/user")
const cloudinary = require("cloudinary")

dotenv.config({ path: './config.env' })
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



const getAllProperties = async (req, res) => {
    const { _end, _order, _start, _sort, title_like = '', propertyType = '' } = req.query
    const query = {}
    if (title_like !== '') {
        query.title_like = { $regax: title_like, $option: "1" }
    }
    if (propertyType !== '') {
        query.propertyType = { $regax: propertyType, $option: "1" }
    }
    try {
        const count = await propertyModel.countDocuments({ query })
        const properties = await propertyModel.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order === "asc" ? 1 : -1 })
        res.header("x-total-count", count)
        res.header("Access-Control-Expose-Headers", "x-total-count")
        res.status(200).json(properties)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getPropertyDetail = async (req, res) => {
    const { id } = req.params
    const propertyExits = await propertyModel.findOne({ _id: id }).populate('creator')
    if (propertyExits) {
        return res.status(200).json(propertyExits)
    }
    else {
        return res.status(400).json({ message: "Property not found" })
    }
}

const createProperty = async (req, res) => {
    try {
        const { title,
            propertyType,
            description,
            location,
            price,
            photo,
            email } = req.body
        const session = await mongoose.startSession()
        session.startTransaction()
        const user = await userModel.findOne({ email }).session(session)
        if (!user) {
            throw new Error("User not found")
        }
        const photoURL = await cloudinary.uploader.upload(photo)
        const newProperty = new propertyModel({
            title,
            propertyType,
            description,
            location,
            price,
            photo: photoURL.url,
            creator: user._id
        })
        user.allProperties.push(newProperty._id)
        await user.save({ session })
        await session.commitTransaction()
        return res.status(200).json({ message: "Property created successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const updateProperty = async (req, res) => {
    try {
        const { id } = req.params
        const { title,
            propertyType,
            description,
            location,
            price,
            photo,
            email } = req.body
        const photoURL = await cloudinary.uploader.upload(photo)
        await propertyModel.findByIdAndUpdate({
            _id: id
        },
            {
                title,
                propertyType,
                description,
                location,
                price,
                photo: photoURL.url || photo
            })
        return res.status(200).json({ message: "Property updated successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params
        const propertyExits = await propertyModel.findById({ _id: id }).populate('creator')
        if (!propertyExits) {
            throw new Error("Property not found")
        }
        const session = await mongoose.startSession()
        session.startTransaction()
        await propertyModel.deleteOne({ _id: id },{session})
        propertyExits.creator.allProperties.pull(propertyExits)
        await propertyExits.creator.save({session})
        await session.commitTransaction()
        return res.status(200).json({message:"Property deleted successfully"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

module.exports = {getAllProperties,getPropertyDetail,createProperty,updateProperty,deleteProperty}