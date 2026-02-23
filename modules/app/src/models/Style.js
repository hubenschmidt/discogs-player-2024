module.exports = (sequelize, DataTypes) => {
    const Style = sequelize.define(
        'Style',
        {
            Name: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
        },
        {
            tableName: 'Style',
            timestamps: true,
        },
    );

    Style.associate = (models) => {
        Style.belongsToMany(models.Release, {
            through: 'ReleaseStyle',
            foreignKey: 'Style_Name',
            otherKey: 'Release_Id',
        });
    };

    return Style;
};
