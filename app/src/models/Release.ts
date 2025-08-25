module.exports = (sequelize: any, DataTypes: any) => {
    const Release = sequelize.define(
        'Release',
        {
            Release_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            Date_Added: {
                type: DataTypes.DATE,
            },
            Thumb: {
                type: DataTypes.STRING,
            },
            Cover_Image: {
                type: DataTypes.STRING,
            },
            Title: {
                type: DataTypes.STRING,
            },
            Year: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'Release',
            timestamps: true,
        },
    );

    Release.associate = (models: any) => {
        Release.belongsToMany(models.Artist, {
            through: 'ReleaseArtist',
            foreignKey: 'Release_Id',
            otherKey: 'Artist_Id',
        });

        Release.belongsToMany(models.Label, {
            through: 'ReleaseLabel',
            foreignKey: 'Release_Id',
            otherKey: 'Label_Id',
        });

        Release.belongsToMany(models.Genre, {
            through: 'ReleaseGenre',
            foreignKey: 'Release_Id',
            otherKey: 'Genre_Name',
        });

        Release.belongsToMany(models.Style, {
            through: 'ReleaseStyle',
            foreignKey: 'Release_Id',
            otherKey: 'Style_Name',
        });

        Release.belongsToMany(models.Collection, {
            through: 'ReleaseCollection',
            foreignKey: 'Release_Id',
            otherKey: 'Collection_Id',
        });
    };

    return Release;
};
