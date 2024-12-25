const { type } = require('@testing-library/user-event/dist/cjs/utility/type.js');
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
 
  username: {
    type: String,
    required: true,
    unique: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
  },
  password:{
    type: String,
    required: true
  },
  role:{
    type: String,
    default: "user"
  },
   gender:{
    type : String,
    required: true
   },

  profilePicture: {
    type: String,
    default: null, 
  },

  createdAt: {
    type: String,
    default: () => new Date().toISOString(), 
  },
});


const User = mongoose.model('User ', userSchema);

module.exports = User;