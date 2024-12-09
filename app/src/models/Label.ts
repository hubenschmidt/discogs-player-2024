module.exports = (sequelize: any, DataTypes: any) => {
    const Label = sequelize.define(
        'Label',
        {
            Label_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            Name: {
                type: DataTypes.STRING,
            },
            Release_Id: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: 'Label',
            timestamps: true,
        },
    );

    Label.associate = (models: any) => {
        Label.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return Label;
};
