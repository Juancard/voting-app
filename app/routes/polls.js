'use strict';

module.exports = function (app, appEnv) {

  var PollHandler = require(appEnv.path + "/app/controllers/pollHandler.server.js");
  var pollHandler = new PollHandler();

  app.route('/')
      .get(function (req, res) {
        pollHandler.getPolls(function(err, polls){
          if (!err){
            let out = {
              pollsOwner: false,
              polls
            }
            res.render(appEnv.path + '/app/views/polls.pug', out);
          }
        });

      });

  app.route('/polls/mypolls')
      .get(appEnv.middleware.isLoggedIn, function (req, res) {
        pollHandler.getPollsByUserId(req.user._id, function(err, polls){
          let out = {
            pollsOwner: true,
            polls
          }
          res.render(appEnv.path + '/app/views/polls.pug', out);
        });
      });

  app.route('/polls/newpoll')
      .get(appEnv.middleware.isLoggedIn, function (req, res) {
        res.render(appEnv.path + '/app/views/newpoll.pug');
      })
      .post(appEnv.middleware.isLoggedIn, pollHandler.addPoll);

  app.route('/polls/:id')
      .get(function (req, res) {
        pollHandler.getPollById(req.params.id, function(err, poll){
          poll = poll.toObject();
          poll.options = poll.options.map(o => JSON.parse(JSON.stringify(o)));
          let out = {poll}
          res.render(appEnv.path + '/app/views/poll.pug', out);
        });
      });
}
