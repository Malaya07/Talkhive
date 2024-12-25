const { type } = require("@testing-library/user-event/dist/cjs/utility/index.js");
const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  id: {type:String, required:true ,unique:true},
  name: { type: String, required: true, unique:true },
  admin:{
    type:String,
    required:true
  },
  participants: [{ type: String, required: true }],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId
    },
  ],
}, { timestamps: true },

);

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
