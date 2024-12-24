
const express = require('express');
const { calculate } = require('../controllers/calculatorController');
const validateInput = require('../middleware/validateInput');

const router = express.Router();

router.post('/', validateInput, calculate);

module.exports = router;
