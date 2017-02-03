'use strict';

module.exports = function (app, appEnv) {

  var PollHandler = require(appEnv.path + "/app/controllers/pollHandler.server.js");
  var pollHandler = new PollHandler();

  app.param("poll_id",  function (req, res, next, pollId) {

    console.log("Requested poll id: ", pollId);

    // ... VALIDATE POLL ID
    pollHandler.getPollById(pollId, function(err, poll){
      if (err) return next(err);
      if (!poll) return res.render(appEnv.path + '/app/views/404.pug');
      // SAVE POLL
      req.poll = poll
      return next();
    });
  });

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
      .post(appEnv.middleware.isLoggedIn, function(req, res){
        pollHandler.addPoll(req.user, req.body, function(err, result){
          let out = {}
          if (err) {
            out.error = error;
            out.message = "Error: on creating poll. Please, try again later.";
          } else {
            out.message = "Your new poll was created!";
            out.redirect = "/polls/" + result._id;
            out.poll = result;
          }
          res.json(out)
        });
      });

  app.route('/polls/:poll_id([a-fA-F0-9]{24})')
      .get(function (req, res) {
        res.render(appEnv.path + '/app/views/poll.pug', {poll: req.poll});
      });

  app.route('/api/polls/:poll_id([a-fA-F0-9]{24})')
    .get(function(req, res){
      res.json({poll: req.poll});
    })
    .delete(function(req, res) {
      pollHandler.removePoll(req.poll._id, req.user._id, function(err, result){
        let out = {}
        if (err) {
          out.error = true;
          out.message = err;
        } else if (!result){
          out.error = true;
          out.message = "You are not allowed to remove this poll";
        } else {
          out.message = "Your poll was removed";
          out.redirect = "/";
        }
        res.json(out)
      });
    });

  app.route('/api/polls/votes/add')
    .post(function(req, res){
      let userId = (req.user && req.user._id) || null;
      pollHandler.hasVoted(req.body.pollId, userId, (err, hasVoted) => {
        if (hasVoted) return res.json({
          error: true,
          message: "Sorry: You've already voted on this poll"
        });
        pollHandler.addVote(req.body.optionId, userId, (err, pollOption) => {
          if (err) return res.json({
            error: err,
            message: "Error while adding vote to our database"
          });
          console.log("votaste", pollOption);
          res.json({
            error: false,
            message: "Vote added!",
            pollOption
          });
        });
      })
    });

    app.route('/api/polls/options/add')
      .post(function(req, res){

        if (!req.user) return res.json({
            error: true, message: "Only authenticated users can add options to polls"
          });
        let userId = req.user._id
        pollHandler.addOption(req.body.pollId, req.body.optionText, userId, function(err, pollOption){
          if (err) {
            res.json({
              error: true,
              message: err
            });
          } else {
            res.json({
              error: false,
              message: "Option added!",
              pollOption
            });
          }
        });
      });

}
