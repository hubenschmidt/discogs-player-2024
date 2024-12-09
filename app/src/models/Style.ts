module.exports = (sequelize: any, DataTypes: any) => {
    const Style = sequelize.define(
        'Style',
        {
            Style_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Release_Id: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'Style',
            timestamps: true,
        },
    );

    Style.associate = (models: any) => {
        Style.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return Style;
};
