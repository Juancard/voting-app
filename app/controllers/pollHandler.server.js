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

  this.addPoll = function (req, res) {
    var newPoll = new Poll();
    newPoll.userId = req.user._id;
    newPoll.title = req.body.title;
    newPoll.options = [];
    for (let op in req.body.options){
      newPoll.options.push({
        displayName: op,
        votes: 0
      });
    }
    newPoll.save(function(err, result){
      if (err) throw err;
      res.json(result);
    });
  };
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
