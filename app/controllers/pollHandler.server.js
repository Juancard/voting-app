'use strict';

var Poll = require('../models/polls.js');
var PollOption = require('../models/pollOptions.js');
var Vote = require('../models/votes.js');
var ip = require("ip");

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
    let newPoll = Poll.newInstance(user._id, poll.title);

		let allPollOptionsCreated = [];
    for (let op in poll.options){
			// Populate Poll Options
			let newPollOption = PollOption.newInstance(newPoll._id, user._id, poll.options[op]);

			// save option in poll
			newPoll.options.push(newPollOption._id);

			// ready with this option
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
	this.addVote = function(optionId, userId, voterIp, callback){
		PollOption
				.findById(optionId)
				.exec(function (err, pollOption) {
								if (err) return callback(err);
								if (!pollOption) return callback(true);

								// Create and fill vote
								let vote = Vote.newInstance(optionId, userId, voterIp);

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
	this.addOption = function(poll, optionText, userId, callback){
		// If option text already exists, error
		let found = poll.options.find(o => o.displayName == optionText);
		if (found) return callback("The option already exists");

		// all is ok. let's create the option
		let newPollOption = PollOption.newInstance(poll._id, userId, optionText);
		//@TODO if poll.AUTHOR != userId: state="pending"
		// until poll author activate it or not
		//newPollOption.state = "pending";

		newPollOption.save(function(err, pollOption){
			if (err) return callback(err);
			poll.options.push(pollOption._id);
			poll.save((err, poll) => {
				if (err) return callback(err);
				return callback(false, pollOption);
			});
		});
	},

	/*
	Remove Poll:
	It receives poll to be removed
	and user id who requested te removal
	It removes poll, options of the poll and votes from each option
	*/
	this.removePoll = (pollToRemove, userId, callback) => {
		console.log("Poll to be removed: ", pollToRemove._id, "by", pollToRemove.author.displayName);

		// In case given poll is populated or not
		let pollAuthor = pollToRemove.author._id || pollToRemove.author;
		let optionsToRemove = pollToRemove.options.map(o => o._id || o);
		console.log("Options to be removed: ", optionsToRemove);

		// Only author of the poll can remove the poll
		if (!pollAuthor.equals(userId)) return callback("Error: You have no permissions to delete this poll");

		// Get options to remove
		PollOption
			.find({_id: {$in: optionsToRemove}})
			.exec((err, optionDocs) => {
				if (err) return callback("Error: On gathering poll options from database. Please try again later.");
				optionDocs.forEach(o => {

					// Get votes to remove
					Vote
						.update({_id: {$in: o.votes}}, {state: "inactive"})
						.exec((err, res) => {
							if (err) return callback("Error: on removing votes. Please try again later.");
							o.state = "inactive";
							o.save( (err, result) => {
								if (err) return callback(err);
								if (!result) return callback("Error: Unexpected failure in saving a deleted option. Please, try again later.");
								console.log("Finish removing Option", result.displayName);
							});
						});
				});
			});

			// fINALLY, REMOVE POLL
			//@TODO Promises: only remove pollToRemove when all options finished removing succesfully
			pollToRemove.active = false;
			pollToRemove.save( (err, result) => {
				if (err) return callback(err);
				if (!result) return callback("Error: Unexpected failure in saving deleted poll. Please, try again Later.");
				console.log("Finish removing poll");
				return callback(false, result);
			});
			/*
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
			*/
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
	this.getAllVotersIdFromPoll = (pollId, callback) => {
		this.getAllVotesFromPoll(pollId, (err, votes) => {
			if (err) return callback(err);
			let out = votes.reduce((votersId, vote) => {
				votersId.push(vote.voter);
				return votersId;
			}, []);
			callback(false, out);
		})
	},
	this.hasVoted = (poll, userId, userIp, callback) => {
		// the options I want the votes to be in
		let allPollOptions = poll.options;
		let toSearch = {
			"pollOption": {$in: allPollOptions}
		};

		// if is an authenticated user, search by user id
		if (userId) {
			toSearch["voter"] = userId;
		} else {
			// if not authenticated search by ip
			toSearch["_voterIp_buf"] = ip.toBuffer(userIp)
		}

		// Search votes under given conditions
		Vote
			.find(toSearch)
			.exec((err, votesGivenByThisUser) => {
				if (err) return callback(err);

				// HASVOTED is true when array is NOT empty
				callback(false, votesGivenByThisUser.length > 0);
			});
	}
}

module.exports = pollHandler;
