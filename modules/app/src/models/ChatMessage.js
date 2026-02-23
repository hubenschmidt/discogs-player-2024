module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define(
        'ChatMessage',
        {
            ChatMessage_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ChatSession_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Role: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            Tool_Calls: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            Tool_Call_Id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'ChatMessage',
            timestamps: true,
        },
    );

    ChatMessage.associate = (models) => {
        ChatMessage.belongsTo(models.ChatSession, {
            foreignKey: 'ChatSession_Id',
        });
    };

    return ChatMessage;
};
