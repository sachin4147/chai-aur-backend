
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  education: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    required: true
  }
});

// Create compound index on name and email
ownerSchema.index({ name: 1, email: 1 });
ownerSchema.index({ email: 1 });
ownerSchema.plugin(mongooseAggregatePaginate);

const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;