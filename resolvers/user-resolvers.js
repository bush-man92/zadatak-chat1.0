
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
			.catch((error) => {
				return "False"
			  })
			if (!check_token) {
				return "False"
			}
			const user = await models.User.findOne({ where: { id : check_token.user.id } })
			if (user.is_logged_in) {
				return "True"
			}
			else {
				return "False"
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
			{ user: _.pick(user, ['id', 'role', 'is_logged_in'])}, SECRET, {expiresIn: '30s' });

			return token;
		};

const logout = async (parent, { logged_token } , {models, SECRET}) => {
			const logged_token_check = await jwt.verify(logged_token, SECRET);
			const user = await models.User.findOne({ where: { id : logged_token_check.user.id } })

			models.User.update({is_logged_in : false},
				{ where: { username: user.username } })
			const token = jwt.sign(
			{ user: _.pick(user, ['id', 'role', 'is_logged_in'])}, SECRET, {expiresIn: '1d' });

			return token;
};

export {allUsers, getUser, updateUser, deleteUser, register, login, logout, banUser, validToken};
