module.exports = (sequelize: any, DataTypes: any) => {
    const Playlist = sequelize.define(
        'Playlist',
        {
            Playlist_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: DataTypes.STRING,
            },
            Name: {
                type: DataTypes.STRING,
            },
            Description: {
                type: DataTypes.INTEGER,
            },
            Tracks_Count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'Playlist',
            timestamps: true,
        },
    );

    Playlist.associate = (models: any) => {
        Playlist.belongsTo(models.User, {
            foreignKey: 'User_Id',
        });

        Playlist.belongsToMany(models.Video, {
            through: 'PlaylistVideo',
            foreignKey: 'Playlist_Id',
            otherKey: 'Video_Id',
        });
    };

    return Playlist;
};
