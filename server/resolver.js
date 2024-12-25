const { AuthenticationError } = require("apollo-server");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Message = require("./model/message");
const mongoose = require("mongoose");
const ChatRoom = require("./model/chatRoom");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const resolvers = {
  Query: {
    users: async (_, __, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to access this resource"
        );
      }
      return await User.find();
    },
    user: async (_, { id }, context) => {
      if (!context.user)
        throw new AuthenticationError(
          "You must be logged in to access this resource"
        );
      return await User.findById(id);
    },
    userByEmail: async (_, { email }, context) => {
      if (!context.user)
        throw new AuthenticationError(
          "You must be logged in to access this resource"
        );
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      return user;
    },
    getChatRooms: async (_, __, context) => {
      if (!context.user)
        throw new AuthenticationError(
          "You must be logged in to access this resource"
        );

      const participant = await User.findById(context.user.userId);
      if (!participant) throw new Error("User not found");

      const chatRooms = await ChatRoom.find({
        participants: participant.username,
      });
      return chatRooms;
    },
    messageByRoom: async (_, { Chatroomname }, context) => {
      if (!context.user)
        throw new AuthenticationError(
          "You must be logged in to access this resource"
        );

      const messages = await Message.find({ ChatRoomname: Chatroomname }).sort({
        timestamp: 1,
      });
      const sanitizedMessages = messages
        .filter((msg) => msg.ChatRoomname) // Filter out messages missing ChatRoomname
        .map((msg) => ({
          id: msg.id,
          message: msg.message,
          sendername: msg.sendername,
          createdAt: msg.timestamp,
          ChatRoomname: msg.ChatRoomname,
          Date: msg.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
      return sanitizedMessages;
    },
  },

  Mutation: {
    signup: async (_, { userNew }) => {
      const userExists = await User.findOne({ email: userNew.email });
      if (userExists) throw new Error("Email already exists");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userNew.password, salt);
      
      console.log(userNew)
      const newUser = new User({
        ...userNew,
        password: hashedPassword,
      });
      await newUser.save();
      return newUser;
    },

    signin: async (_, { userNew }) => {
      const user = await User.findOne({ email: userNew.email });
      if (!user)
        throw new AuthenticationError("User does not exist with that email");

      const doMatch = await bcrypt.compare(userNew.password, user.password);
      if (!doMatch) throw new AuthenticationError("Password is incorrect");

      const token = jwt.sign(
        { userId: user.id, email: userNew.email, profilePicture: user.profilePicture },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );
      return { token };
    },
    createMessage: async (_, { sendername, Chatroomname, text }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");

      const chatRoom = await ChatRoom.findOne({ name: Chatroomname });
      if (!chatRoom) throw new Error("Chatroom does not exist");

      if (!chatRoom.participants.includes(sendername)) {
        throw new Error("You are not a participant in this chatroom");
      }

      const message = new Message({
        message: text,
        sendername: sendername,
        ChatRoomname: Chatroomname,
        timestamp: new Date(),
      });
      await message.save();

      pubsub.publish(`NEW_MESSAGE_${Chatroomname}`, { newMessage: message });

      return message;
    },

    createChatRoom: async (_, { id, name }, { user }) => {
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to create a chat room"
        );

      const creator = await User.findById(user.userId);
      if (!creator) throw new Error("User not found");

      const existingChatRoom = await ChatRoom.findOne({ id });
      if (existingChatRoom) {
        throw new Error("Chat room with this ID already exists");
      }

      const newChatRoom = new ChatRoom({
        id,
        name,
        admin:creator.username,
        participants: [creator.username],
        messages: [],
      });
      await newChatRoom.save();
     // console.log("Publishing CHAT_ROOM_CREATED for:", newChatRoom)
  pubsub.publish("CHAT_ROOM_CREATED", { chatRoomCreated : newChatRoom.toObject() });
  // console.log(newChatRoom)
  console.log("Published CHAT_ROOM_CREATED with payload:", newChatRoom.toObject());
      return newChatRoom;
    },

    joinChatRoom: async (_, { chatroomname, participantname }, { user }) => {
      const chatRoom = await ChatRoom.findOne({ name: chatroomname });
      if (!chatRoom) throw new Error("Chatroom does not exist");

      const userdata = await User.findOne({ email:user.email})
      //console.log(username)
      if(participantname !== userdata.username){
        throw new Error("You are not the person, you are trying to join as")
      }
      
      if (!chatRoom.participants.includes(participantname)) {
        chatRoom.participants.push(participantname);

        await chatRoom.save();
      }
      else{
        console.log(" You are already a participant")
      }
      pubsub.publish("ROOM_UPDATED", { roomUpdated: chatRoom });

      return chatRoom;
    },
    updateChatRoom: async (_, { chatroomname, updatedname }, { user }) => {
      // Check if the user is authenticated
      //console.log("update start")
      if (!user) throw new AuthenticationError("You are not logged in");
    
      // Find the chat room by name
      const chatRoom = await ChatRoom.findOne({ name: chatroomname });
      if (!chatRoom) throw new Error("Chatroom does not exist");
    
      const adminUser=await User.findById(user.userId)
     // console.log(adminUser," ",chatRoom.admin)
      if(adminUser.username !== chatRoom.admin) throw new Error("You are not the admin")
      // Update the chat room name and return the updated document
      const updatedChatRoom = await ChatRoom.findOneAndUpdate(
        { name: chatroomname },  // Query
        { $set: { name: updatedname } },  // Update
        { new: true }  // Return the updated document
      );
    
      if (!updatedChatRoom) {
        throw new Error("Failed to update chatroom name");
      }
      const updateMessagesResult = await Message.updateMany(
        { 
          ChatRoomname: chatroomname },  // Messages associated with the old room name
        { $set: { 
          ChatRoomname: updatedname } }  // Update to the new room name
      );
      console.log(updateMessagesResult)
      if (updateMessagesResult.nModified === 0) {
        console.warn("No messages were updated; ensure that messages exist for this room.");
      }
    
      return updatedChatRoom;
    
    },
    leaveRoom: async (_, { chatroomname }, { user }) => {
      // Check if the chatroom name is provided
      if (!chatroomname) throw new Error("Need a chatroom name");
    
      // Find the chatroom in the database
      const chatRoom = await ChatRoom.findOne({ name: chatroomname });
      if (!chatRoom) throw new Error("Chatroom does not exist");
    
      // Ensure user is authenticated
      if (!user) throw new Error("Authentication required");
      
      const user1 = await User.findById(user.userId)
      // Check if the user is part of the chatroom
      if (!chatRoom.participants.includes(user1.username)) {
        throw new Error("User is not part of this chatroom");
      }
       
      // Remove the user from the chatroom's member list
      chatRoom.participants = chatRoom.participants.filter(member => member !== user1.username);
      
      // Save the updated chatroom
      await chatRoom.save();
    
      return {
        success: true,
        message: "You have successfully left the chatroom",
        chatroom: chatRoom,
      };
    },
    deleteUser:async(_,{chatroomname,username,yourname},{user})=>{
      if (!chatroomname) throw new Error("Need a chatroom name");
    
      // Find the chatroom in the database
      const chatRoom = await ChatRoom.findOne({ name: chatroomname });
      if (!chatRoom) throw new Error("Chatroom does not exist");
    
      // Ensure user is authenticated
      if (!user) throw new Error("Authentication required");
      
      if (!chatRoom.participants.includes(username)) {
        throw new Error("User is not part of this chatroom");
      }
      //const adminUser=await User.findByOne({name:yourname})
      console.log(chatRoom.admin," ", yourname)
      if(yourname !== chatRoom.admin) throw new Error("You are not the admin")

      chatRoom.participants = chatRoom.participants.filter(member => member !== username);
      
      // Save the updated chatroom
      await chatRoom.save();
      return chatRoom;
    }
    
  },

  Subscription: {
    newMessage: {
      subscribe: (_, { Chatroomname }) => {
        if (!Chatroomname) throw new Error("Chatroomname is required for subscription");
         
        return pubsub.asyncIterator(`NEW_MESSAGE_${Chatroomname}`);
      },
      resolve: (payload) => {
       // console.log("Payload in newMessage subscription:", payload);
        return payload.newMessage;
      },
    },
    chatRoomCreated: {
      subscribe: () => {
        //console.log("Subscription to CHAT_ROOM_CREATED established");
        const hell=pubsub.asyncIterator("CHAT_ROOM_CREATED");
       // console.log("hell:",hell)
        return hell;
      },
      resolve: (payload) => {
        //console.log("Payload in chatRoomCreated subscription:", payload);
        if (!payload || !payload.chatRoomCreated) {
          console.error("Invalid payload in chatRoomCreated:", payload);
          return null;
        }
        return payload.chatRoomCreated;
      },
    },
    roomUpdated: {
      subscribe: () => {
        //console.log("Subscription to ROOM_UPDATED established");
        return pubsub.asyncIterator(["ROOM_UPDATED"]);
      },
      resolve: (payload) => {
        //console.log("Payload in roomUpdated subscription:", payload);
        if (!payload || !payload.roomUpdated) {
          console.error("Invalid payload in roomUpdated:", payload);
          return null;
        }
        return payload.roomUpdated;
      },
    },
  },
  
};

module.exports = resolvers;
