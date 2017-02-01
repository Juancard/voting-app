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

module.exports = mongoose.model('Poll', Poll);
