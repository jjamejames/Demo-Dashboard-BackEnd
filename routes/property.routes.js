const express = require('express')
const propertyController = require('../controller/property.controller')

const propertyRouter = express.Router()

propertyRouter.route('/').get(propertyController.getAllProperties).post(propertyController.createProperty)
propertyRouter.route('/:id').get(propertyController.getPropertyDetail).delete(propertyController.deleteProperty).patch(propertyController.updateProperty)

module.exports = propertyRouter