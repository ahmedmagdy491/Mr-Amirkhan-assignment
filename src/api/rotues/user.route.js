const UserCtrl = require('../ctrls/users.ctrl');
const verifySendEmail = require('../middlewares/sendEmail');
const verifyCode = require('../middlewares/verifyEmailCode');
let passHelper = {};
const router = require('express').Router();
router.route('/sendEmail').post(UserCtrl.sendEmailToRegister);
router
	.route('/sendEmailToResetPassword')
	.post(UserCtrl.sendEmailToResetPassword);
router.route('/register').post(UserCtrl.register);
router.route('/login').post(UserCtrl.login);

module.exports = router;
