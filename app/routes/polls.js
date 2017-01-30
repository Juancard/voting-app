'use strict';

module.exports = function (app, appEnv) {

  var PollHandler = require(appEnv.path + "/app/controllers/pollHandler.server.js");
  var pollHandler = new PollHandler();

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
          }],
          pollsOwner: true
        }
        res.render(appEnv.path + '/app/views/polls.pug', out);
      });

  app.route('/polls/newpoll')
      .get(appEnv.middleware.isLoggedIn, function (req, res) {
        let out = {
          user: req.user
        }
        res.render(appEnv.path + '/app/views/newpoll.pug', out);
      })
      .post(appEnv.middleware.isLoggedIn, pollHandler.addPoll);
}
