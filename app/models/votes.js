'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Vote = new Schema({
  pollOption: {type: Schema.Types.ObjectId, ref: 'PollOption'},
  voter: {type: Schema.Types.ObjectId, ref: 'User'},
  state: String,
  creationDate: Date
});

module.exports = mongoose.model('Vote', Vote);
