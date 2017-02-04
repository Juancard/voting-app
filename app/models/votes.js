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

module.exports = mongoose.model('Vote', Vote);
