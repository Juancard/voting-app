'use strict';

module.exports = function (app, appEnv) {

  app.route('/polls/mypolls')
      .get(appEnv.middleware.isLoggedIn, function (req, res) {
        let out = {
          user: req.user,
          polls: [{
            id: "ds232fas",
            title: "mypoll1"
          },
          {
            id: "w12121fs34sd",
            title: "mypoll2"
          }]
        }
        res.render(appEnv.path + '/app/views/index.pug', out);
      });

}
