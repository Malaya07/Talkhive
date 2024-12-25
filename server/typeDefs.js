const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    gender: String!
    role: String!
    profilePicture: String
    createdAt: String!
    }
    type Message {
      id: ID!
      message: String!
      sendername: String!
      ChatRoomname: String!
      createdAt: String!
      Date: String!
    }

  input UserInput {
    username: String!
    email: String!
    password: String!
    gender: String!
    profilePicture: String
    }

  input UserSigninInput {
    email: String!
    password: String!
  }

  type token {
    token: String!
  }

  type ChatRoom {
    id: String!
    name: String!
    admin:String!
    participants: [String!]!
    messages: [Message!]
}
type Mutation {
  signup(userNew: UserInput!): User
  signin(userNew: UserSigninInput!): token
  createMessage(sendername: String!,Chatroomname:String!, text: String!): Message
  createChatRoom(id: String! ,name: String!): ChatRoom  # Name should be passed as a string here
  joinChatRoom(chatroomname: String!,participantname:String!):ChatRoom
  updateChatRoom(chatroomname: String!,updatedname: String!): ChatRoom
  leaveRoom(chatroomname: String!): LeaveRoomResponse!
  deleteUser(chatroomname: String!, username: String!, yourname: String!):ChatRoom
}

type LeaveRoomResponse {
  success: Boolean!
  message: String!
  chatroom: ChatRoom
}


  type Query {
    users: [User!]!
    user(id: ID!): User
    userByEmail(email: String!): User
    messageByRoom(Chatroomname: String!): [Message]
    getChatRooms: [ChatRoom!]
    
    
  }

 type Subscription {
  newMessage(Chatroomname: String!): Message!
   chatRoomCreated: ChatRoom!
  roomUpdated: ChatRoom!
}
`;

module.exports = typeDefs;
