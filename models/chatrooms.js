export default (sequelize, DataTypes) => {
	const Chatroom = sequelize.define('Chatroom',{
		title:{ 
			type:DataTypes.STRING,
			unique: true, 
		},
	});
		return Chatroom;
}