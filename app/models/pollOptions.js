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

PollOption
  .virtual('totalVotes')
    .get(function () {
      // RETURNS ALL VOTES, INCLUDING INACTIVE ONES
      return this.votes.length;
    });

PollOption.methods.lala = function findSimilarType (cb) {
  return this.model('Animal').find({ type: this.type }, cb);
};

PollOption
  .statics.newInstance = function newInstance(poll, author, displayName,
    state="active", creationDate=new Date(), votes=[]) {
  let newPollOption = new this();

  newPollOption.author = author;
  newPollOption.creationDate = creationDate;
  newPollOption.displayName =  displayName;
  newPollOption.poll = poll;
  newPollOption.state = state;
  newPollOption.votes = votes;

  return newPollOption;
}

module.exports = mongoose.model('PollOption', PollOption);
