const Session = require('../schemas/sessions.schema');
const idGenerator = require('../../api/helpers/idGenerator');
const User = require('../schemas/users.schema');
class UserDAO {
	static register(information) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(
					await User.create({ ...information, _id: idGenerator() })
				);
			} catch (error) {
				reject(error);
			}
		});
	}
	static login(credentials) {
		return new Promise(async (resolve, reject) => {
			let result;
			try {
				result = await Session.updateOne(
					{ user: credentials.user },
					{ $set: { token: credentials.token } }
				);
				if (!result.matchedCount) {
					result = await Session.create(credentials);
					if (!result) {
						reject({
							error: 'error occured while login, try again later',
						});
					}
				}
				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}

	static getUser(email) {
		return new Promise(async (resolve, reject) => {
			try {
				const user = await User.findOne({ email });
				if (!user) {
					resolve({
						success: false,
						message: 'user not found',
					});
				}
				resolve(user);
			} catch (error) {
				reject(error);
			}
		});
	}

	static resetPassword(email, newPassword) {
		return new Promise(async (resolve, reject) => {
			try {
				await User.updateOne(
					{ email },
					{ $set: { password: newPassword } }
				);

				resolve({ success: true });
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = UserDAO;
