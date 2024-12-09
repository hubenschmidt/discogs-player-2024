module.exports = (sequelize: any, DataTypes: any) => {
    const Style = sequelize.define('Styles', {
        Style_Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Style.associate = (models: any) => {
        Style.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return Style;
};
