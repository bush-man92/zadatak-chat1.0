import { addMessage , messageAdded, messages } from './subscriptions-resolver';
import { allUsers, getUser, updateUser, deleteUser, register, login } from './user-resolvers'

const resolvers = {
	Query: {
		messages,
		allUsers,
		getUser,
	},
	
	Mutation: {
		addMessage,
		updateUser,
		deleteUser,
		register,
		login
	},
	Subscription: {
		messageAdded
	}
};

export default resolvers;