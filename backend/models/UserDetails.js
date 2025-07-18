//models/UserDetails.js
import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String },
lastName: { type: String },
street: { type: String },
region: { type: String },
postalCode: { type: String },
phone: { type: String },
floor: {type : Number},
doorbell: {type: String}

});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
export default UserDetails;
