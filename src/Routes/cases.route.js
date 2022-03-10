const express = require('express');
const router = express.Router();

const controller =  require('./Controllers/cases.controller');

router.get('/cases', controller.getCases);
router.get('/cases/range', controller.getRangeCases);

module.exports = router