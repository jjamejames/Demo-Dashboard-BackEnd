const express = require('express')
const userController = require('../controller/user.controller')

const userRouter = express.Router()
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser)
userRouter.route('/:id').get(userController.getUserInfoByID)

module.exports = userRouter