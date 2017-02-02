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
			newPollOption.state = "active";

      newPoll.options.push(newPollOption._id);
			allPollOptionsCreated.push(newPollOption);
    }

		// Save Poll Options
		PollOption.insertMany(allPollOptionsCreated, (err, result) => {
			if (err) {
				return callback(err);
			} else {
				// Save Poll
				newPoll.save(function(err, result){
					if (err) {
						return callback(err);
					} else {
						return callback(false, result);
					}
				});
			}
		})
  };

  this.getPollsByUserId = function(userId, callback){
    Poll
        .find({userId, active: true})
				.populate("author")
				.populate("options")
				.populate("votes")
        .exec(function (err, result) {
                if (err) {
									callback(err);
								} else {
									callback(false, result);
								}
            });
  }
  this.getPollById = function(id, callback){
    Poll
        .findOne({_id: id, active:true})
				.populate("author")
				.populate("options")
				.populate("votes")
        .exec(function (err, result) {
                if (err) {
									callback(err);
								} else {
									callback(false, result);
								}
            });
  }
	this.addVote = function(optionId, userId, callback){
		PollOption
				.findById(optionId)
				.exec(function (err, pollOption) {
								if (err) {
									callback(err);
								} else if (!pollOption) {
									callback(true);
								} else {
									// Create and fill vote
									let vote = new Vote();
									vote.creationDate = new Date();
									vote.voter = userId;
									vote.pollOption = optionId;
									vote.state = "active";

									// Save vote
									vote.save(function(err, vote){
										if (err) callback(err);

										// Add vote to option
										pollOption.votes.push(vote._id);
										pollOption.save((err, pollOption) => {
											if (err) {
												callback(err);
											} else {
												callback(false, pollOption);
											}
										});
									});
								}
						});
	},
	this.addOption = function(pollId, optionText, userId, callback){
		Poll
				.findById(pollId)
				.populate("options")
				.exec(function (err, poll) {
					if (err) {
						callback(err);
					} else if (!poll) {
						callback("The specified poll does not exist");
					} else {
						let found = poll.options.find(o => o.displayName == optionText)
						if (found) {
							callback("The option already exists");
						} else {
							let newPollOption = new PollOption();
							if (userId) newPollOption.author = userId;
							newPollOption.creationDate = Date();
							newPollOption.displayName =  optionText;
							newPollOption.poll = poll._id;
							//@TODO if poll.AUTHOR != userId: state="pending"
							// until poll author activate it or not
							newPollOption.state = "active";

							newPollOption.save(function(err, pollOption){
								if (err) {
									callback(err);
								} else {
									poll.options.push(pollOption._id);
									poll.save((err, poll) => {
										if (err) {
											callback(err);
										} else callback(false, pollOption);
									});
								}
							});
						}
					}
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
