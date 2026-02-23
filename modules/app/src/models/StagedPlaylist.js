module.exports = (sequelize, DataTypes) => {
    const StagedPlaylist = sequelize.define(
        'StagedPlaylist',
        {
            StagedPlaylist_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ChatSession_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            User_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            Name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            Status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'draft',
            },
        },
        {
            tableName: 'StagedPlaylist',
            timestamps: true,
        },
    );

    StagedPlaylist.associate = (models) => {
        StagedPlaylist.belongsTo(models.ChatSession, {
            foreignKey: 'ChatSession_Id',
        });
        StagedPlaylist.belongsTo(models.User, {
            foreignKey: 'User_Id',
        });
        StagedPlaylist.hasMany(models.StagedPlaylistVideo, {
            foreignKey: 'StagedPlaylist_Id',
            as: 'Videos',
        });
    };

    return StagedPlaylist;
};
