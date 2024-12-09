module.exports = (sequelize: any, DataTypes: any) => {
    const User = sequelize.define('User', {
        User_Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Username: {
            type: DataTypes.STRING,
        },
    });

    User.associate = (models: any) => {
        User.hasOne(models.User, {
            foreignKey: 'User_Id',
        });
    };

    return User;
};
