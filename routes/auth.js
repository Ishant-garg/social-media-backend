const { loginController, signupController, refreshTokenController } = require("../controllers/authController");

const router = require("express").Router();

router.post('/login' , loginController);
router.post('/signup' , signupController);
router.get('/refresh' , refreshTokenController);

       
module.exports = router;