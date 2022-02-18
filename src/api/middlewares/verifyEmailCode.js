const verifyCode = (req, res, next, info) => {
	try {
		if (
			req.body.code !== info.EmailCode ||
			new Date().getMinutes() - info.createdAt > 5
		) {
			res.status(401).json({
				error: 'invalid code',
			});
			return;
		}

		req.body.user_info = info.user_info;
		next();
	} catch (error) {
		res.status(500).json(error);
	}
};

module.exports = verifyCode;
