'use strict';

var Poll = require('../models/polls.js');
var PollOption = require('../models/pollOptions.js');
var Vote = require('../models/votes.js');

function pollHandler () {

	this.getPolls = function (callback) {
	    Poll
	        .find({active: true})
					.populate("author")
					.populate("options")
					.populate("votes")
	        .exec(function (err, result) {
	                if (err) callback(err);
                  callback(err, result);
	            });
	};

  this.addPoll = function (user, poll, callback) {
		// Date to use many times
		let now = new Date();

		// Populate Poll Object
    let newPoll = new Poll();
    newPoll.author = user._id;
    newPoll.title = poll.title;
		newPoll.active = true;
		newPoll.creationDate = now;

		// Populate Poll Options
		let allPollOptionsCreated = [];
    for (let op in poll.options){
			let newPollOption = new PollOption();

			newPollOption.author = user._id;
			newPollOption.creationDate = now;
			newPollOption.displayName =  poll.options[op];
			newPollOption.poll = newPoll._id;

      newPoll.options.push(newPollOption._id);
			allPollOptionsCreated.push(newPollOption);
    }

		// Save Poll Options
		PollOption.insertMany(allPollOptionsCreated, (err, result) => {
			if (err) return callback(err);

			// Save Poll
			newPoll.save(function(err, result){
				if (err) return callback(err);
				return callback(false, result);
			});
		})
  };

  this.getPollsByUserId = function(userId, callback){
    Poll
        .find({userId, active: true})
				.populate("author")
				.populate("options")
				.populate("votes")
        .exec(function (err, result) {
                if (err) callback(err);
                callback(false, result);
            });
  }
  this.getPollById = function(id, callback){
    Poll
        .findOne({_id: id, active:true})
				.populate("author")
				.populate("options")
				.populate("votes")
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
	},
	this.removePoll = (pollId, userId, callback) => {
	    Poll
	        .findOneAndUpdate({_id: pollId, userId: userId}, { active: false })
	        .exec(function (err, result) {
	                if (err) callback(err);
	                callback(false, result);
	            }
	        );
	};
}

module.exports = pollHandler;
