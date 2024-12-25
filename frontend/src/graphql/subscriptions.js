import { gql } from '@apollo/client';

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription Subscription($chatroomname: String!) {
    newMessage(Chatroomname: $chatroomname) {
      message
      sendername
      createdAt
      ChatRoomname
    }
  }
`;

export const ROOM_CREATED_SUBSCRIPTION = gql`
  subscription Subscription {
   chatRoomCreated {
      id
      name
      participants
      messages {
       sendername
      }
    }
  }
`;

export const ROOM_UPDATED_SUBSCRIPTION = gql`
  subscription Subscription {
    roomUpdated {
      id
      name
      participants
    }
  }
`;
