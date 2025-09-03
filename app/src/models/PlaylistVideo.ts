module.exports = (sequelize: any, DataTypes: any) => {
    const PlaylistVideo = sequelize.define(
        'PlaylistVideo',
        {
            PlaylistVideo_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Playlist_Id: {
                type: DataTypes.INTEGER,
            },
            Video_Id: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'PlaylistVideo',
            timestamps: true,
        },
    );

    return PlaylistVideo;
};
