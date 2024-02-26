const express = require("express");
const router = express.Router();

router.use("/quiz", require("./quiz/quiz.routes"));
router.use("/auth", require("./auth/auth.routes"));

module.exports = router;
