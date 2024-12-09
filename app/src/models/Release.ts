module.exports = (sequelize: any, DataTypes: any) => {
    const Release = sequelize.define('Release', {
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
    });

    Release.associate = (models: any) => {
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
