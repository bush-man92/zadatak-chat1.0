import { addMessage , messageAdded, messages } from './subscriptions-resolver';
import { allUsers, getUser, updateUser, deleteUser, register, login, logout, banUser } from './user-resolvers'

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
		login,
		logout,
		banUser
	},
	Subscription: {
		messageAdded
	}
};

export default resolvers;