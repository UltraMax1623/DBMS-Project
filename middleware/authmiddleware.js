function isLoggedIn(req, res, next) {
	if (!req.session.user) {
		return res.status(401).send("Please login first");
	}
	next();
}
module.exports = isLoggedIn;
