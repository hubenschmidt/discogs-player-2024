module.exports = (sequelize: any, DataTypes: any) => {
    const Video = sequelize.define(
        'Video',
        {
            Video_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            URI: {
                type: DataTypes.STRING,
            },
            Title: {
                type: DataTypes.STRING,
            },
            Duration: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'Video',
            timestamps: true,
        },
    );

    Video.associate = (models: any) => {
        Video.belongsToMany(models.Release, {
            through: 'ReleaseVideo',
            foreignKey: 'Video_Id',
            otherKey: 'Release_Id',
        });

        Video.belongsToMany(models.User, {
            through: 'UserVideo',
            foreignKey: 'Video_Id',
            otherKey: 'User_Id',
        });
    };

    return Video;
};
