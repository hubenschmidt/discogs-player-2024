module.exports = (sequelize: any, DataTypes: any) => {
    const History = sequelize.define(
        'History',
        {
            History_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Video_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Release_Id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            Played_At: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'History',
            timestamps: true,
        },
    );

    History.associate = (models: any) => {
        History.belongsTo(models.User, { foreignKey: 'User_Id' });
        History.belongsTo(models.Video, { foreignKey: 'Video_Id' });
        History.belongsTo(models.Release, { foreignKey: 'Release_Id' });
    };

    return History;
};
