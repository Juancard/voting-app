'use strict';

module.exports = function (app, appEnv) {

  var PollHandler = require(appEnv.path + "/app/controllers/pollHandler.server.js");
  var pollHandler = new PollHandler();

  let hasNotVoted = (req, res, next) => {
    let pollId = req.poll;
    let voterId = (req.user && req.user._id) || null;
    let voterIp = req.clientIp;
    pollHandler.hasVoted(pollId, voterId, voterIp, (err, hasVoted) => {
      if (hasVoted) return res.json({
        error: true,
        message: "Sorry: You've already voted on this poll"
      });
      return next();
    });
  }

  let isLoggedInJson = function(req, res, next) {
     if (req.isAuthenticated()){
       return next();
     } else {
       res.json({
         error: true,
         message: "Only authenticated users can perform this action"
       });
     }
   }


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
      .post(isLoggedInJson, function(req, res){
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
    .delete(isLoggedInJson, function(req, res) {
      pollHandler.removePoll(req.poll, req.user._id, function(err, result){
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

  app.route('/api/polls/:poll_id([a-fA-F0-9]{24})/add/vote')
    .post(hasNotVoted, function(req, res){
      let voterId = (req.user && req.user._id) || null;
      let voterIp = req.clientIp;
      let optionVotedId = req.body.optionId;
      pollHandler.addVote(optionVotedId, voterId, voterIp, (err, pollOption) => {
        if (err) return res.json({
          error: err,
          message: "Error while adding vote to our database"
        });
        res.json({
          error: false,
          message: "Vote added!",
          pollOption
        });
      });
    });

    app.route('/api/polls/:poll_id([a-fA-F0-9]{24})/add/option/with/vote')
      .post(isLoggedInJson, hasNotVoted, (req, res) => {
        let optionVotedText = req.body.optionText;
        let voterId = req.user._id;
        let voterIp = req.clientIp;
        pollHandler.addOption(req.poll, optionVotedText, voterId, (err, pollOption) => {
          if (err) return res.json({
            error: true,
            message: err
          });
          pollHandler.addVote(pollOption._id, voterId, voterIp, (err, pollOption) => {
            if (err) return res.json({
              error: err,
              message: "Error while adding vote to our database"
            });
            return res.json({
              error: false,
              message: "Option and vote added!",
              pollOption
            });
          });
        });
      });

    app.route(isLoggedInJson, '/api/polls/:poll_id([a-fA-F0-9]{24})/add/option')
      .post(function(req, res){
        let userId = req.user._id;
        let optionText = req.body.optionText;
        pollHandler.addOption(req.poll, optionText, userId, (err, pollOption) => {
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
