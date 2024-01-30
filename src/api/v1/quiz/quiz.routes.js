const express = require('express');
const router = express.Router();
const { create, getByCategory } = require('./quiz.controller');

router.post('/', create);
router.get('/:category', getByCategory);

module.exports = router;