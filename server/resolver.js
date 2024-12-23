const { AuthenticationError } = require("apollo-server");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Message = require("./model/message");
const mongoose = require("mongoose");
const ChatRoom = require("./model/chatRoom");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();
//const CHAT_ROOM_CREATED = "CHAT_ROOM_CREATED";

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
        { userId: user.id, email: userNew.email },
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
        participants: [creator.username],
        messages: [],
      });
      await newChatRoom.save();

      pubsub.publish("CHAT_ROOM_CREATED", { chatRoomCreated : newChatRoom });

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
      //if(participantname )
      // console.log(chatRoom.participants.includes(participantname))
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
  },

  Subscription: {
    newMessage: {
      subscribe: (_, { Chatroomname }) => {
        if (!Chatroomname) throw new Error("Chatroomname is required for subscription");
        return pubsub.asyncIterator(`NEW_MESSAGE_${Chatroomname}`);
      },
      resolve: (payload) => {
        console.log("Payload in newMessage subscription:", payload);
        return payload.newMessage;
      },
    },
    chatRoomCreated: {
      subscribe: () => {
        console.log("Subscription to CHAT_ROOM_CREATED established");
        return pubsub.asyncIterator(["CHAT_ROOM_CREATED"]);
      },
      resolve: (payload) => {
        console.log("Payload in chatRoomCreated subscription:", payload);
        if (!payload || !payload.chatRoomCreated) {
          console.error("Invalid payload in chatRoomCreated:", payload);
          return null;
        }
        return payload.chatRoomCreated;
      },
    },
    roomUpdated: {
      subscribe: () => {
        console.log("Subscription to ROOM_UPDATED established");
        return pubsub.asyncIterator(["ROOM_UPDATED"]);
      },
      resolve: (payload) => {
        console.log("Payload in roomUpdated subscription:", payload);
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
