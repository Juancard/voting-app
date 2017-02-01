'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Vote = new Schema({
  PollOption: {type: Schema.Types.ObjectId, ref: 'PollOption'},
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  state: String,
  creationDate: Date
});

module.exports = mongoose.model('Vote', Vote);
