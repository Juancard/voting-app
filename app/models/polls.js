'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Poll = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  active: Boolean,
  options: [{
    displayName: String,
    votes: Number
  }]
});

module.exports = mongoose.model('Poll', Poll);
