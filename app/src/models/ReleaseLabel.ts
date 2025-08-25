module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseLabel = sequelize.define(
        'ReleaseLabel',
        {
            Release_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Release',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Label_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Label',
                    key: 'Label_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseLabel',
            timestamps: true,
        },
    );

    return ReleaseLabel;
};
