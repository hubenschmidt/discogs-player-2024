module.exports = (sequelize, DataTypes) => {
    const Genre = sequelize.define(
        'Genre',
        {
            Name: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
        },
        {
            tableName: 'Genre',
            timestamps: true,
        },
    );

    Genre.associate = (models) => {
        Genre.belongsToMany(models.Release, {
            through: 'ReleaseGenre',
            foreignKey: 'Genre_Name',
            otherKey: 'Release_Id',
        });
    };

    return Genre;
};
