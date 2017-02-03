'use strict';

module.exports = function (app, appEnv) {

  app.route('/api/:user_id')
			.get(appEnv.middleware.isLoggedIn, function (req, res) {
				res.json(req.user.twitter);
			});

}
