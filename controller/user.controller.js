const userModel = require("../model/user")

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).limit(req.query._end)
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const createUser = async (req, res) => {
    try {
        const { name, email, avatar } = req.body
        const userExits = await userModel.findOne({ email })
        if (userExits) {
            return res.status(200).json(userExits)
        }
        const newUser = new userModel.create({ name, email, avatar })
        return res.status(200).json(newUser)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

const getUserInfoByID = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findOne({ _id: id }).populate("allProperties")
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
