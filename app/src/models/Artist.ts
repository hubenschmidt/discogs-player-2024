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
            Date_Added: {
                type: DataTypes.DATE,
            },
            Release_Id: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'Artist',
            timestamps: true,
        },
    );

    Artist.associate = (models: any) => {
        Artist.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return Artist;
};
