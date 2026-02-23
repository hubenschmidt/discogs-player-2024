module.exports = (sequelize, DataTypes) => {
    const ChatSession = sequelize.define(
        'ChatSession',
        {
            ChatSession_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'ChatSession',
            timestamps: true,
        },
    );

    ChatSession.associate = (models) => {
        ChatSession.belongsTo(models.User, {
            foreignKey: 'User_Id',
        });
        ChatSession.hasMany(models.ChatMessage, {
            foreignKey: 'ChatSession_Id',
            as: 'Messages',
        });
        ChatSession.hasMany(models.StagedPlaylist, {
            foreignKey: 'ChatSession_Id',
            as: 'StagedPlaylists',
        });
    };

    return ChatSession;
};
