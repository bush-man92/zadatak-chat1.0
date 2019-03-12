export default (sequelize, DataTypes) => {
	const Message = sequelize.define('Message', {
		text: {
			type:DataTypes.STRING
		},
		chatroomId: {
			type:DataTypes.STRING
		},
		username: {
			type:DataTypes.STRING
		},
	});


return Message;
}