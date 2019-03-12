
export default (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		username:{
			type:DataTypes.STRING,
			unique: true,
		},
		email:{
			type:DataTypes.STRING,
			unique: true,
		},
		password:{
			type:DataTypes.STRING
		},
		is_logged_in:{
			type:DataTypes.BOOLEAN
		},
		
		is_banned:{
			type:DataTypes.BOOLEAN
		},
		role:{
			type:DataTypes.INTEGER
		}
	});

		return User;
}

