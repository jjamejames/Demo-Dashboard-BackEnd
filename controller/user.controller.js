const userModel = require("../model/user")

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).limit(req.query._end) // find all record
        if(!users){
            return res.status(500).json({ message: "User not found" }) // กรณีไม่มี user เลย
        }
        return res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const createUser = async (req, res) => {
    try {
        const { name, email, avatar } = req.body 
        const userExists = await userModel.findOne({ email }) // หา document แรกที่ตรงกับเงื่อนไข
        if (userExists) {
            return res.status(200).json(userExists)
        }
        const newUser = await userModel.create({ name, email, avatar }) // สร้าง user ใหม่
        return res.status(200).json(newUser)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

const getUserInfoByID = async (req, res) => {
    try {
        const { id } = req.params 
        const user = await userModel.findOne({ _id: id }).populate("allProperties") // หา user by ID และทำการดึงค่า allProperties ที่เป็น FK มาด้วย
        if (user) {
            return res.status(200).json(user)
        } else {
            return res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

module.exports = {getUserInfoByID,getAllUsers,createUser}
