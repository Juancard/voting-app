'use strict';


module.exports = function (app, appEnv) {

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });

  app.route('/auth/twitter')
		.get(appEnv.passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(appEnv.passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
}
