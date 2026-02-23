module.exports = (sequelize, DataTypes) => {
    const StagedPlaylistVideo = sequelize.define(
        'StagedPlaylistVideo',
        {
            StagedPlaylistVideo_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            StagedPlaylist_Id: {
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
            Position: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            AI_Rationale: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'StagedPlaylistVideo',
            timestamps: true,
        },
    );

    StagedPlaylistVideo.associate = (models) => {
        StagedPlaylistVideo.belongsTo(models.StagedPlaylist, {
            foreignKey: 'StagedPlaylist_Id',
        });
        StagedPlaylistVideo.belongsTo(models.Video, {
            foreignKey: 'Video_Id',
        });
        StagedPlaylistVideo.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return StagedPlaylistVideo;
};
