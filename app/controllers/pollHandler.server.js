'use strict';

var Poll = require('../models/polls.js');

function pollHandler () {

	this.getPolls = function (callback) {
	    Poll
	        .find({})
	        .exec(function (err, result) {
	                if (err) callback(err);
                  callback(err, result);
	            });
	};

  this.addPoll = function (user, poll, callback) {
    var newPoll = new Poll();
    newPoll.userId = user._id;
    newPoll.title = poll.title;
    newPoll.options = [];
    for (let op in poll.options){
      newPoll.options.push({
        displayName: poll.options[op],
        votes: 0
      });
    }
    newPoll.save(function(err, result){
      if (err) return callback(err);
      return callback(false, result);
    });
  };

  this.getPollsByUserId = function(userId, callback){
    Poll
        .find({userId})
        .exec(function (err, result) {
                if (err) callback(err);
                callback(false, result);
            });
  }
  this.getPollById = function(id, callback){
    Poll
        .findById(id)
        .exec(function (err, result) {
                if (err) callback(err);
                callback(false, result);
            });
  }
	this.addVote = function(pollId, option, callback){
		Poll
				.findById(pollId)
				.exec(function (err, poll) {
								if (err) callback(err);
								let optionVoted = poll.options.find(op => op.displayName == option);
								if (!optionVoted) {
									poll.options.push({
										displayName: option,
										votes: 1
									});
								} else {
									optionVoted.votes++;
								}
								poll.save(function(err, result){
									if (err) callback(err);
									callback(false, result);
								})

						});
	}

/*
	this.removePoll = function (req, res) {
	    Poll
	        .findOneAndUpdate({'github.id': req.user.github.id}, { 'nbrClicks.clicks': 0 })
	        .exec(function (err, result) {
	                if (err) { throw err; }

	                res.json(result.nbrClicks);
	            }
	        );
	};
*/

}

module.exports = pollHandler;
