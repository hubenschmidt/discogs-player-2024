module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define(
        'Collection',
        {
            Collection_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        },
        {
            tableName: 'Collection',
            timestamps: true,
        },
    );

    Collection.associate = (models) => {
        Collection.belongsTo(models.User, {
            foreignKey: 'User_Id',
        });

        Collection.belongsToMany(models.Release, {
            through: 'ReleaseCollection',
            foreignKey: 'Collection_Id',
            otherKey: 'Release_Id',
        });
    };

    return Collection;
};
