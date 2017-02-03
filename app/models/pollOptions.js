'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PollOption = new Schema({
  displayName: String,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  state: String,
  creationDate: Date,
  poll: {type: Schema.Types.ObjectId, ref: 'Poll'},
  votes: [{type: Schema.Types.ObjectId, ref: 'Vote'}]
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

PollOption.virtual('totalVotes').get(function () {
  return this.votes.length;
});

module.exports = mongoose.model('PollOption', PollOption);