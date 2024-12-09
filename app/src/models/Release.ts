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
        Release.belongsToMany(models.Collection, {
            through: 'CollectionReleases', // Name of the junction table
            foreignKey: 'Release_Id',
            otherKey: 'Collection_Id',
        });

        Release.hasMany(models.Artist, {
            foreignKey: 'Release_Id',
        });

        Release.hasMany(models.Genre, {
            foreignKey: 'Release_Id',
        });

        Release.hasMany(models.Style, {
            foreignKey: 'Release_Id',
        });
    };

    return Release;
};
