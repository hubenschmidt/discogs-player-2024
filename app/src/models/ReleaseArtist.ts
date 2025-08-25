module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseArtist = sequelize.define(
        'ReleaseArtist',
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
            Artist_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Artist',
                    key: 'Artist_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseArtist',
            timestamps: true,
        },
    );

    return ReleaseArtist;
};
