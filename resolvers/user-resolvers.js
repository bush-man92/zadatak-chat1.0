
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

const allUsers = (parent, args, { models }) => { return models.User.findAll() };

const getUser = (parent , { username, id }, { models }) =>{
			if (username) {
				return models.User.findOne({where:{ username } }) }
			else if (id) {
				return models.User.findOne({where:{ id } }) }
		};

const userOverview = async (parent, { id }, { models }) => {
			const users = await models.User.findAll();
			class userView {
				constructor(username, id, is_logged_in) {
					this.username = username;
					this.id = id;
					this.is_logged_in = is_logged_in
				}
			}
			const user_views = []
			users.forEach(element => {
				if (id !== element.id) {
					const user = new userView(element.username, element.id, element.is_logged_in)
					user_views.push(user)
				}
			});
			
			return user_views;
}
		
const updateUser = async (parent, { username, newUsername, password, newPassword, token }, { models, SECRET }) => {
			const token_check = await jwt.verify(token, SECRET);
			const user = await models.User.findOne({ where: { id: token_check.user.id } });
			const response = [];
			if (user.id == token_check.user.id) {
				if (newUsername) {
					if (newUsername == await models.User.findOne({ where: { username } })) {
						response.push('Username already taken');
					}
					models.User.update({username : newUsername},
						{ where: { username } })
					response.push('Username changed');
				}
				if (newPassword) {
					const valid = await bcrypt.compare(password, user.password);
					if(!valid){
						response.push('Incorrect password');
					}
					const pass = await bcrypt.hash(newPassword, 12);
					models.User.update({password : pass},
						{ where: { username: user.username } })
					}
					response.push('Password changed');
				}
			else {
				response.push('Not authorized to change user');
				}
			return response;
			}

const deleteUser = (parent , { id } , { models }) => {
			models.User.destroy({
				where: { id } })
		};

const banUser = async (parent, { username, token}, { models, SECRET }) => {
			const token_check = await jwt.verify(token, SECRET);
			const user = await models.User.findOne({ where: { id : token_check.user.id } });
			if (user.role == 2) {
				banned_user = await models.User,findOne({ where: { username }});
				banned_user.is_banned = true;
				return 'User banned'
			}
			else {
				return 'Not a moderator'
			}
		};

const validToken = async (parent, { token }, { models, SECRET }) => {
			const check_token = await jwt.verify(token, SECRET)
			const user = await models.User.findOne({ where: { id : check_token.user.id } })
			class validToken {
				constructor(response, id) {
					this.response = response;
					this.id = id;
				}
			}
			if (user.is_logged_in) {
				return new validToken("True", check_token.user.id)
			}
			else {
				return new validToken("False", check_token.user.id)
			}
}

const register = async (parent, {username, password, email} ,{ models, SECRET}) =>{
			const check_username = await models.User.findOne({ where: { username } })
			const check_email = await models.User.findOne({ where: {email} })
			if (check_username != null) {
				return 'Username already taken';
			}

			else if (check_email != null) {
				return 'Email already exists';
			}
			
			const user = {username, password, email, is_banned : false, is_logged_in : true, role: 1}
			user.password = await bcrypt.hash(user.password, 12);
			const user2 = await models.User.create(user);

		  	const token = jwt.sign(
				{ user: _.pick(user2, ['id', 'role', 'is_logged_in'])}, SECRET, {expiresIn: '1d' });
			/*await pubsub.publish("2", {
				UserAdded: user.username});*/
			return token;
		};

const login = async (parent, { username, password, used_token } ,{ models, SECRET }) => {
			if (used_token) {
				const used_token_check = await jwt.verify(used_token, SECRET);
				const user = await models.User.findOne({ where: { id : used_token_check.user.id } });
				if (user.is_logged_in) {
					return 'Logged in'
				}
			}
			
			const user = await models.User.findOne({ where: { username } });
			if (!user) {
				return ('There is no user with that username');
			}
			if (user.is_banned && Date.now() < new Date(user.updatedAt.getTime() + 86400000)) {
				var banned_until = new Date(user.updatedAt.getTime() + 86400000)
				return ('You are banned from the chat until ' + banned_until.toLocaleString());
			}

			const valid = await bcrypt.compare(password, user.password);
			if(!valid){
				return ('Incorrect password');
			}

			models.User.update({is_logged_in : true},
				{ where: { username: user.username } })
			const token = jwt.sign(
			{ user: _.pick(user, ['id', 'role', 'is_logged_in'])}, SECRET, {expiresIn: '7d' });

			/*await pubsub.publish("2", {
				UserAdded: user.username});*/

			return token;
		};

const logout = async (parent, { logged_token } , {models, SECRET}) => {
			const token = await jwt.verify(logged_token, SECRET);
			const user = await models.User.findOne({ where: { id : token.user.id } })

			models.User.update({is_logged_in : false},
				{ where: { username: user.username } })

			return "Succesfull logout"
};

export { allUsers, getUser, updateUser, deleteUser, register, login, logout, banUser, validToken, userOverview };
