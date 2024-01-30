const express = require('express');
const router = express.Router();

router.use('/quiz', require('./quiz/quiz.routes'));

module.exports = router;