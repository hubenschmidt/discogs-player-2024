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
                allowNull: false,
            },
            Video_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'PlaylistVideo',
            timestamps: true,
        },
    );

    // helper to bump count + touch updatedAt atomically
    const bumpPlaylist = async (
        playlistId: number,
        delta: number,
        transaction: any,
    ) => {
        const { Playlist } = sequelize.models;
        await Playlist.update(
            {
                // Postgres-safe increment and floor at 0 on decrements
                Tracks_Count: sequelize.literal(
                    `GREATEST("Tracks_Count" + (${delta}), 0)`,
                ),
                updatedAt: sequelize.literal('clock_timestamp()'),
            },
            { where: { Playlist_Id: playlistId }, transaction },
        );
    };

    PlaylistVideo.addHook(
        'afterCreate',
        async (instance: any, options: any) => {
            await bumpPlaylist(instance.Playlist_Id, +1, options.transaction);
        },
    );

    PlaylistVideo.addHook(
        'afterDestroy',
        async (instance: any, options: any) => {
            await bumpPlaylist(instance.Playlist_Id, -1, options.transaction);
        },
    );

    PlaylistVideo.associate = (models: any) => {
        PlaylistVideo.belongsTo(models.Video, {
            foreignKey: 'Video_Id',
        });
        PlaylistVideo.belongsTo(models.Playlist, {
            foreignKey: 'Playlist_Id',
        });
    };

    return PlaylistVideo;
};
