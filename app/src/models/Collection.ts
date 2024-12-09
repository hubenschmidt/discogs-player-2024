module.exports = (sequelize: any, DataTypes: any) => {
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

    Collection.associate = (models: any) => {
        Collection.belongsTo(models.User, {
            foreignKey: 'User_Id',
        });
    };

    return Collection;
};
