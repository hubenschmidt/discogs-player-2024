module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseVideo = sequelize.define(
        'ReleaseVideo',
        {
            Release_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Release',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Video_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Video',
                    key: 'Video_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseVideo',
            timestamps: true,
        },
    );

    return ReleaseVideo;
};
