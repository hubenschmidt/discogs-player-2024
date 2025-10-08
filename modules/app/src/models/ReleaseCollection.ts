module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseCollection = sequelize.define(
        'ReleaseCollection',
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
            Collection_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Collection',
                    key: 'Collection_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseCollection',
            timestamps: true,
        },
    );

    return ReleaseCollection;
};
