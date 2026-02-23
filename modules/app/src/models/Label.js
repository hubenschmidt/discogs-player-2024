module.exports = (sequelize, DataTypes) => {
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

    Label.associate = (models) => {
        Label.belongsToMany(models.Release, {
            through: 'ReleaseLabel',
            foreignKey: 'Label_Id',
            otherKey: 'Release_Id',
        });
    };

    return Label;
};
