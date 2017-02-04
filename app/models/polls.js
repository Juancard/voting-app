'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Poll = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  creationDate: Date,
  title: String,
  active: Boolean,
  options: [{type: Schema.Types.ObjectId, ref: 'PollOption'}]
});

Poll
  .statics
  .newInstance = function newInstance(author, title, state=true,
    creationDate=new Date(), options=[]) {
  let newPoll = new this();

  newPoll.author = author;
  newPoll.title = title;
  newPoll.active = state;
  newPoll.creationDate = creationDate;
  newPoll.options = [];

  return newPoll;
}

module.exports = mongoose.model('Poll', Poll);
