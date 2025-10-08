module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseStyle = sequelize.define(
        'ReleaseStyle',
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
            Style_Name: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Style',
                    key: 'Name',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseStyle',
            timestamps: true,
        },
    );

    return ReleaseStyle;
};
