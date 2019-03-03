import { addMessage , messageAdded, messages } from './subscriptions-resolver';
import { allUsers, getUser, updateUser, deleteUser, register, login, logout, banUser, validToken} from './user-resolvers'

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
		banUser,
		validToken
	},
	Subscription: {
		messageAdded
	}
};

export default resolvers;