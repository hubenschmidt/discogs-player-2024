module.exports = (sequelize: any, DataTypes: any) => {
    const Artist = sequelize.define(
        'Artist',
        {
            Artist_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            Name: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'Artist',
            timestamps: true,
        },
    );

    Artist.associate = (models: any) => {
        Artist.belongsToMany(models.Release, {
            through: 'ReleaseArtist',
            foreignKey: 'Artist_Id',
            otherKey: 'Release_Id',
        });
    };

    return Artist;
};
