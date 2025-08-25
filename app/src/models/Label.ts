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
            Cat_No: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'Label',
            timestamps: true,
        },
    );

    Label.associate = (models: any) => {
        Label.belongsToMany(models.Release, {
            through: 'ReleaseLabel',
            foreignKey: 'Label_Id',
            otherKey: 'Release_Id',
        });
    };

    return Label;
};
