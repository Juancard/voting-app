'use strict';

var Poll = require('../models/polls.js');
var PollOption = require('../models/pollOptions.js');
var Vote = require('../models/votes.js');

function pollHandler () {

	this.getPolls = function (callback) {
	    Poll
	        .find({active: true})
					.populate('author')
					.populate({
						path: "options",
						model: "PollOption",
						populate: {
							path: 'votes',
							model: 'Vote'
						}
					})
	        .exec(function (err, result) {
	                if (err) return callback(err);
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
			//@TODO CALL this.addOption here!
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
			if (err) return callback(err);
			// Save Poll
			newPoll.save(function(err, result){
				if (err) return callback(err);
				return callback(false, result);
			});
		});
  };

  this.getPollsByUserId = function(userId, callback){
    Poll
        .find({author: userId, active: true})
				.populate('author')
				.populate({
					path: "options",
					model: "PollOption",
					populate: {
						path: 'votes',
						model: 'Vote'
					}
				})
        .exec(function (err, result) {
                if (err) return callback(err);
								callback(false, result);
            });
  }
  this.getPollById = function(id, callback){
    Poll
        .findOne({_id: id, active:true})
				.populate('author')
				.populate({
					path: "options",
					model: "PollOption",
					populate: {
						path: 'votes',
						model: 'Vote'
					}
				})
        .exec(function (err, result) {
                if (err) return callback(err);
								callback(false, result);
            });
  }
	this.addVote = function(optionId, userId, callback){
		PollOption
				.findById(optionId)
				.exec(function (err, pollOption) {
								if (err) return callback(err);
								if (!pollOption) return callback(true);
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
										if (err) return callback(err);
										callback(false, pollOption);
									});
								});
						});
	},
	this.addOption = function(pollId, optionText, userId, callback){
		Poll
				.findById(pollId)
				.populate("options")
				.exec(function (err, poll) {
					if (err) return callback(err);
					if (!poll) return callback("The specified poll does not exist");
					let found = poll.options.find(o => o.displayName == optionText)
					if (found) return callback("The option already exists");
					let newPollOption = new PollOption();
					if (userId) newPollOption.author = userId;
					newPollOption.creationDate = Date();
					newPollOption.displayName =  optionText;
					newPollOption.poll = poll._id;
					//@TODO if poll.AUTHOR != userId: state="pending"
					// until poll author activate it or not
					newPollOption.state = "active";

					newPollOption.save(function(err, pollOption){
						if (err) return callback(err);
						poll.options.push(pollOption._id);
						poll.save((err, poll) => {
							if (err) return callback(err);
							return callback(false, pollOption);
						});
					});
			});
	},

	/*
	Remove Poll:
	It receives poll id to be removed
	and user id who requested te removal
	It removes poll, options of the poll and votes from each option
	*/
	this.removePoll = (pollId, userId, callback) => {
		console.log("Poll to be removed: ", pollId);
	  Poll
	    .findOne({_id: pollId, author: userId})
			.exec(function (err, pollToRemove) {
				console.log("Poll found: ", pollId);
        if (err) return callback(err);
				if (!pollToRemove) return callback("Error: You have no permissions to delete this poll");
				pollToRemove.options.forEach(idOptionToRemove => {
					console.log("Option to be removed: ", idOptionToRemove);
					PollOption
						.findById(idOptionToRemove)
						.exec((err, optionToRemove) => {
							if (err) return callback("Error: On removing options. Please try again later.");
							optionToRemove.votes.forEach(idVote => {
								console.log("Vote to be removed: ", idVote);
								Vote
									.findById(idVote)
									.exec((err, voteToRemove) => {
										console.log("Vote searched vs received: ", idVote, voteToRemove);
										if (err) return callback("Error: on removing votes. Please try again later.");
										voteToRemove.state = "inactive";
										voteToRemove.save( (err, result) => {
											if (err) return callback(err);
											if (!result) return callback("Error: Unexpected failure in saving a deleted vote. Please, try again later.");
											console.log("Finish removing vote", result._id);
										});
									})
							});
							//@TODO Promises: only remove PollOption when all votes finished removing succesfully
							optionToRemove.state = "inactive";
							optionToRemove.save( (err, result) => {
								if (err) return callback(err);
								if (!result) return callback("Error: Unexpected failure in saving a deleted option. Please, try again later.");
								console.log("Finish removing Option", result.displayName);
							});
						});
				});
				//@TODO Promises: only remove pollToRemove when all options finished removing succesfully
				pollToRemove.active = false;
				pollToRemove.save( (err, result) => {
					if (err) return callback(err);
					if (!result) return callback("Error: Unexpected failure in saving deleted poll. Please, try again Later.");
					console.log("Finish removing poll");
					return callback(false, result);
				});
			});
	},
	this.getAllVotesFromPoll = (pollId, callback) => {
		this.getPollById(pollId, (err, poll) => {
			if (err) return callback(err);
			let pollVotes = []
			let allOp = poll.options.toObject();
			for (let i in allOp){
				let allVotes = allOp[i].votes.toObject();
				for (let j in allVotes){
					pollVotes.push(allVotes[j])
				}
			}
			callback(false, pollVotes);
		});
	},
	this.getAllVotersFromPoll = (pollId, callback) => {
		this.getAllVotesFromPoll(pollId, (err, votes) => {
			if (err) return callback(err);
			let out = votes.reduce((votersId, vote) => {
				votersId.push(vote.voter);
				return votersId;
			}, []);
			callback(false, out);
		})
	},
	this.hasVoted = (pollId, userId, callback) => {
		this.getAllVotersFromPoll(pollId, (err, voters) => {
			if (err) return callback(err);
			if (!userId) return callback(false, voters.includes(userId)); // PATCH!
			// is objectid in array of objectIds?
			let found = false;
			let i=0;
			voters = voters.filter(v => v != null);
			while (voters[i] && !found){
				found = voters[i].equals(userId)
				i++;
			}
			callback(false, found);
		});
	}
}

module.exports = pollHandler;
