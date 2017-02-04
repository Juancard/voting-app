'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ipAddressPlugin = require("mongoose-ip-address");

var Vote = new Schema({
    pollOption: {type: Schema.Types.ObjectId, ref: 'PollOption'},
    voter: {type: Schema.Types.ObjectId, ref: 'User'},
    state: String,
    creationDate: Date
  },{
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
});

Vote.plugin(ipAddressPlugin, {fields: ["voterIp"]});

Vote
  .statics.newInstance = function newInstance(pollOption, voter,
    voterIp, state="active", creationDate=new Date(), options=[]) {
  let newVote = new this();

  newVote.creationDate = creationDate;
  newVote.voter = voter;
  newVote.pollOption = pollOption;
  newVote.state = state;
  newVote.voterIp = voterIp;

  return newVote;
}

module.exports = mongoose.model('Vote', Vote);
