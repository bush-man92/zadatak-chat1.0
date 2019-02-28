import Sequelize from 'sequelize';
import Chatroom from './chatrooms';
import User from './users';
import Message from './messages';
require('dotenv').config()


const sequelize = new Sequelize(
	 process.env.DB,
	 process.env.DB_USER,
	 process.env.DB_PASS,
	 {
		host : process.env.DB_HOST,
		dialect : process.env.DB_DIALECT
	 }

);

const db = {};



db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.User = User(sequelize, Sequelize);
db.Chatroom = Chatroom(sequelize, Sequelize);
db.Message = Message(sequelize, Sequelize);

export default db;