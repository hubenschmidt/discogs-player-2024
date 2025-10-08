module.exports = (sequelize: any, DataTypes: any) => {
    const ReleaseGenre = sequelize.define(
        'ReleaseGenre',
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
            Genre_Name: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: 'Genre',
                    key: 'Name',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
        },
        {
            tableName: 'ReleaseGenre',
            timestamps: true,
        },
    );

    return ReleaseGenre;
};
