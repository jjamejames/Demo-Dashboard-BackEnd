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
    const { _end, _order, _start, _sort, title_like = '', propertyType = '' } = req.query // ดึงค่ามาจาก query โดย 2 ตัวหลังถ้า client ไม่ใส่มาจะกลายเป็น default ''
    const query = {}
    if (title_like !== '') {
        query.title_like = { $regex: title_like, $options: "i" }
    }
    if (propertyType !== '') {
        query.propertyType = { $regex: propertyType, $options: "i" }
    }
    try {
        const count = await propertyModel.countDocuments({query}) // นับจำนวน prpoerty ทั้งหมดที่ตรงกับเงื่อนไข
        const properties = await propertyModel.find(query)
            .limit(Number(_end) || 0)
            .skip(Number(_start) || 0) // ข้ามข้อมูล
            .sort(_sort ? { [_sort]: _order === "asc" ? 1 : -1 } : {}) // เป็น dynamic key คือเอาตัวแปรมาใส่ key และ asc = 1 , desc = -1
        res.header("x-total-count", count) // เอา count มาแสดง 
        res.header("Access-Control-Expose-Headers", "x-total-count")
        res.status(200).json(properties)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getPropertyDetail = async (req, res) => {
    const { id } = req.params
    const propertyExists = await propertyModel.findOne({ _id: id }).populate('creator') // นำ FK ที่มีชื่อว่า creator มาด้วย
    if (propertyExists) {
        return res.status(200).json(propertyExists)
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
        const user = await userModel.findOne({ email }).session(session) //เพื่อให้การอ่านข้อมูล user นี้อยู่ใน transaction session เดียวกับการสร้าง property และการอัปเดต user ถ้าไม่ใช้ .session(session) การอ่าน user จะอยู่นอก transaction ซึ่งอาจทำให้เกิดปัญหา consistency ได้ในบางกรณี (เช่น มีการแก้ไขข้อมูล user เดียวกันจาก process อื่นระหว่าง transaction)
        if (!user) {
            throw new Error("User not found")
        }
        const photoURL = await cloudinary.uploader.upload(photo)
        const newProperty = new propertyModel({ // คือการสร้าง instance ของ model ที่ชื่อ propertyModel ซึ่ง propertyModel ถูกสร้างมาจาก Property Schema
            title,
            propertyType,
            description,
            location,
            price,
            photo: photoURL.url,
            creator: user._id
        })
        await newProperty.save({ session }); // save newProperty ให้อยู่ใน session นี้
        user.allProperties = user.allProperties || []; // ป้องกัน undefined
        user.allProperties.push(newProperty._id)
        await user.save({ session }) //// save user ให้อยู่ใน session นี้
        await session.commitTransaction() // จบ transaction
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
        const propertyExists = await propertyModel.findById({ _id: id }).populate('creator')
        if (!propertyExists) {
            throw new Error("Property not found")
        }
        const session = await mongoose.startSession()
        session.startTransaction()
        await propertyModel.deleteOne({ _id: id }, { session })
        propertyExists.creator.allProperties.pull(propertyExists)
        await propertyExists.creator.save({ session })
        await session.commitTransaction()
        return res.status(200).json({ message: "Property deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { getAllProperties, getPropertyDetail, createProperty, updateProperty, deleteProperty }