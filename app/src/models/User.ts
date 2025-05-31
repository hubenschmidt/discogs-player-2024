module.exports = (sequelize: any, DataTypes: any) => {
    const User = sequelize.define(
        'User',
        {
            User_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Username: {
                type: DataTypes.STRING,
            },
            OAuth_Access_Token: {
                type: DataTypes.STRING,
            },
            OAuth_Access_Token_Secret: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'User',
            timestamps: true,
        },
    );

    User.associate = (models: any) => {
        User.hasOne(models.Collection, {
            foreignKey: 'User_Id',
        });
    };

    return User;
};
