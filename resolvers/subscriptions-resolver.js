import { Message } from '../models/messages';
import { User } from '../models/users';
import jwt from 'jsonwebtoken';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();
const one = '2'


const messageAdded = {
  resolve: (payload, args, context, info) => {
    return payload.messageAdded;
  },
  subscribe: withFilter( () => pubsub.asyncIterator(one), (payload, args) => { return payload.messageAdded.chatroomId === args.chatroomId} )
};

/*const messageAdded = {
  subscribe: withFilter(
    () => pubsub.asyncIterator(one),
    (payload, args) => {
      return payload.messageAdded.chatroomId === args.chatroomId
    }
  ),
};*/

const addMessage = async (parent, { text, chatroomId, token }, { models, SECRET }) =>{
  const token_check = await jwt.verify(token, SECRET);
  const user_Id = token_check.user.id
  const user = await models.User.findOne({ where: {id: user_Id } });

  const message = await models.Message.create({
    text: text,
    chatroomId: chatroomId,
    username: user.username
  })
    .then((data) => JSON.parse(JSON.stringify(data)))
    .catch((error) => {
      console.log('ERROR WHILE CREATING NEW TEXT MESSAGE');
      return {};
    });

  pubsub.publish(one, {
    messageAdded: message });
  return message;
}


const messages = (parent, { chatroomId }, { models })=>{
  return models.Message.findAll( {where: {chatroomId: chatroomId}});
}

export { addMessage, pubsub, messageAdded, messages };