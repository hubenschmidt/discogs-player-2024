module.exports = (sequelize: any, DataTypes: any) => {
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

    Style.associate = (models: any) => {
        Style.belongsToMany(models.Release, {
            through: 'ReleaseStyle',
            foreignKey: 'Style_Name',
            otherKey: 'Release_Id',
        });
    };

    return Style;
};
