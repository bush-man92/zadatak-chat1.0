import { addMessage , messageAdded, messages, UserAdded } from './subscriptions-resolver';
import { allUsers, getUser, updateUser, deleteUser, register, login, logout, banUser, validToken, userOverview } from './user-resolvers'

const resolvers = {
	Query: {
		messages,
		allUsers,
		getUser,
		userOverview
	},
	
	Mutation: {
		addMessage,
		updateUser,
		deleteUser,
		register,
		login,
		logout,
		banUser,
		validToken
	},
	Subscription: {
		messageAdded,
		UserAdded
	}
};

export default resolvers;