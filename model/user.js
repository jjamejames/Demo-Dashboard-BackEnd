// สร้าง Schema สำหรับเก็บข้อมูล User

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({ // ต้องการให้ Schema เก็บอะไร
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    allProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property", default: [] }] // เหมือน FK
})

const userModel = mongoose.model("User", userSchema) //ประกาศใช้งานเป็นชื่อ User ลงใน Collection

module.exports = userModel