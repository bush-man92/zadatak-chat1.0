import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
require('dotenv').config()

import typeDefs from './schema'
import resolvers from './resolvers/resolvers'
import models from './models/base';


const schema = makeExecutableSchema({ typeDefs, resolvers, });

const SECRET = process.env.not_SECRET

const app = express();

const addUser = async (req) =>{
	const token = req.headers.authorization;
	try{
		const { user } = await jwt.verify(token, SECRET);
		req.user = user;
	}catch (err){
		console.log(err);
	}
	req.next();
};

app.use(cors('*'));
// app.use(addUser);

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress( req => ({ schema, context: { models, SECRET }})),
);

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
  }),
);

app.use(
  '/subscriptions',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
  }),
);

const server = createServer(app);

new SubscriptionServer({
  schema, //: makeExecutableSchema({ typeDefs, customSubscriptionResolver, }),
  execute,
  subscribe,
  onConnect: async (connectionParams, webSocket) => {
    console.log(`Subscription client connected using new SubscriptionServer.`)
  },
  onDisconnect: async (webSocket, context) => {
    console.log(`Subscription client disconnected.`)
  }
}, {
  server,
  path: '/subscriptions',
}, );

models.sequelize.sync({}).then(() => server.listen(process.env.PORT));
