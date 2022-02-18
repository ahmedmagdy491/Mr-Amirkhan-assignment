const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(
	'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'
);

const sendEmail = (email) => {
	const generate_random_6_digits = Math.floor(
		1000 + Math.random() * 900000
	).toString();

	const msg = {
		to: email, // Change to your recipient
		from: 'a.magdy9129@gmail.com', // Change to your verified sender
		subject: 'AHMED MAGDY',
		text: 'please verify this code',
		html: `
				<h2>Please verify the following code:</h2>
				<h2>${generate_random_6_digits}</h2>
			`,
	};
	return new Promise((resolve, reject) => {
		sgMail
			.send(msg)
			.then(() => {
				resolve({
					success: true,
					code: generate_random_6_digits,
					createdAt: new Date().getMinutes(),
				});
			})
			.catch((error) => {
				reject({ error: error.response.body });
			});
	});
};

const verifySendEmail = async (req, res, next) => {
	try {
		const result = await sendEmail(req.body.email);
		if (!result.success) {
			res.status(401).json({
				error: result.error,
			});
			return;
		}
		return {
			success: result.success,
			EmailCode: result.code,
			createdAt: result.createdAt,
			user_info: req.body,
		};
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
};
module.exports = verifySendEmail;
