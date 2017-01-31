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

  app.route('/polls/:id([a-fA-F0-9]{24})')
      .get(function (req, res) {
          res.render(appEnv.path + '/app/views/poll.pug', {pollId: req.params.id});
        });

  app.route('/api/polls/:id([a-fA-F0-9]{24})')
    .get(function(req, res){
      pollHandler.getPollById(req.params.id, function(err, poll){
        if (err) throw err;
        poll = poll.toObject();
        poll.options = poll.options.map(o => JSON.parse(JSON.stringify(o)));
        res.json({poll});
      })
    });

  app.route('/api/polls/add/vote')
    .post(function(req, res){
      pollHandler.addVote(req.body.pollId, req.body.option, function(err, result){
        if (err) {
          res.json({
            error: err,
            message: "Error while adding vote to our database"
          });
        }
        let poll = result.toObject();
        poll.options = poll.options.map(o => JSON.parse(JSON.stringify(o)));
        res.json({
          error: false,
          message: "Vote added!",
          poll
        });
      });
    });

}
