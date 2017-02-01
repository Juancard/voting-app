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

  app.route('/polls/:id([a-fA-F0-9]{24})')
      .get(function (req, res) {
        pollHandler.getPollById(req.params.id, function(err, result){
          if (err) throw err;
          if (!result) res.redirect('*');
          res.render(appEnv.path + '/app/views/poll.pug', {poll: result});
        })
      });

  app.route('/api/polls/:id([a-fA-F0-9]{24})')
    .get(function(req, res){
      pollHandler.getPollById(req.params.id, function(err, poll){
        if (err) throw err;
        if (!poll){
          res.redirect('*');
        }
        poll = poll.toObject();
        poll.options = poll.options.map(o => JSON.parse(JSON.stringify(o)));
        res.json({poll});
      })
    })
    .delete(function(req, res) {
      pollHandler.removePoll(req.params.id, req.user._id, function(err, result){
        let out = {}
        if (err) {
          out.error = error;
          out.message = "Error: on deleting poll. Please, try again later.";
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
