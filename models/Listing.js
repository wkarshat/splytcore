var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};
var locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: false,
    default: ""
  },
  state: {
    type: String,
    required: false,
    default: ""
  },
  zip: {
    type: String,
    required: false,
    default: ""
  }
});
var listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  listedByUserId: {
    type: ObjectId,
    required: true
  },
  dateListed: {
    type: Date,
    default: Date.now,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  /* "Foreign key" to Asset */
  assetId: {
    type: ObjectId,
    required: true
  },
  location: locationSchema,
  expirationDate: {
    type: Date,
    required: true
  },
  isFeatured:{
    type: Boolean,
    default: false,
    required: false
  }
}, schemaOptions);

var Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
