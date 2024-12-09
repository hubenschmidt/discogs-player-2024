module.exports = (sequelize: any, DataTypes: any) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
    });

    return User;
};
