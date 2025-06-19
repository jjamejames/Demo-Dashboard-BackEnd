const express = require('express')
const propertyController = require('../controller/property.controller')

const router = express.Router()
router.route('/').get(propertyController.getAllProperties)