const UserDAO = require('../../dao/services/users.dao.services');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(
	'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'
);

const hashPassword = async (password) => await bcrypt.hash(password, 10);
class User {
	constructor({ email, password } = {}) {
		this.password = password;
		this.email = email;
	}
	toJson() {
		return {
			name: this.name,
			email: this.email,
		};
	}
	async comparePassword(plainText) {
		return await bcrypt.compare(plainText, this.password);
	}
	encoded() {
		return jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
				...this.toJson(),
			},
			process.env.SECRET_KEY
		);
	}
	static async decoded(userJwt) {
		return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
			if (error) {
				return { error };
			}
			return new User(res);
		});
	}

	static sendEmailToResetPassword(email, msg) {
		return new Promise(async (resolve, reject) => {
			const user = await UserDAO.getUser(email);
			if (!user.success) {
				resolve(user);
			}

			sgMail
				.send(msg)
				.then(() => {
					resolve({
						success: true,
						createdAt: new Date().getMinutes(),
					});
				})
				.catch((error) => {
					reject({ error: error.response.body });
				});
		});
	}
}
let params = {};
class UserCtrl {
	static async sendEmailToRegister(req, res, next) {
		const generate_random_6_digits = Math.floor(
			1000 + Math.random() * 900000
		).toString();
		const msg = {
			to: req.body.email, // Change to your recipient
			from: 'a.magdy9129@gmail.com', // Change to your verified sender
			subject: 'AHMED MAGDY',
			text: 'please verify this code',
			html: `
				<h2>Please verify the following code:</h2>
				<h2>${generate_random_6_digits}</h2>
			`,
		};
		try {
			const result = User.sendEmailToResetPassword(req.body.email, msg);

			params = {
				createdAt: result.createdAt,
				EmailCode: generate_random_6_digits,
				user_info: req.body,
			};
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	static async register(req, res, next) {
		try {
			if (
				req.body.code !== params?.EmailCode ||
				new Date().getMinutes() - params.createdAt > 5
			) {
				res.status(401).json({
					error: 'invalid code',
				});
				return;
			}
			const userFromBody = params.user_info;

			const userInfo = {
				email: userFromBody.email,
				password: await hashPassword(userFromBody.password),
			};

			const registerResult = await UserDAO.register(userInfo);

			res.status(201).json({
				result: {
					email: registerResult.email,
					auth_token: new User(registerResult).encoded(),
				},
			});
		} catch (error) {
			next(error);
		}
	}

	static async login(req, res, next) {
		try {
			let user = await UserDAO.getUser(req.body.email);
			if (!user) {
				res.status(404).json({
					error: 'user not found',
				});
				return;
			}
			const user_operations = new User(user);
			const comparePassword = await user_operations.comparePassword(
				req.body.password
			);

			if (!comparePassword) {
				res.status(401).json({
					error: 'invalid credentials',
				});
				return;
			}
			await UserDAO.login({
				user: user._id,
				token: user_operations.encoded(),
			});
			res.json({
				result: {
					auth_token: user_operations.encoded(),
					information: user_operations.toJson(),
				},
			});
		} catch (error) {
			next(error);
		}
	}

	static async sendEmailToResetPassword(req, res, next) {
		const msg = {
			to: req.body.email, // Change to your recipient
			from: 'a.magdy9129@gmail.com', // Change to your verified sender
			subject: 'Reset Password',
			text: 'Reset Password',
			html: `
				<h2>Please click the following link:</h2>
				<h5>${req.body.link}</h5>
			`,
		};
		try {
			console.log(req.body);
			const result = await User.sendEmailToResetPassword(
				req.body.email,
				msg
			);

			if ('success' in result) {
				res.status(404).json(result.message);
				return;
			}
			console.log('res', result);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
	static async resetPassowrd(req, res, next) {
		try {
			const user = await UserDAO.getUser(req.body.email);
			if (!user) {
				res.status(404).json({
					error: 'user not found',
				});
				return;
			}
			const newPassword = hashPassword(req.body.newPassword);
			const result = await UserDAO.resetPassword(user.email, newPassword);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = UserCtrl;
