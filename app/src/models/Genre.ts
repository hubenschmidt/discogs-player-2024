module.exports = (sequelize: any, DataTypes: any) => {
    const Genre = sequelize.define(
        'Genre',
        {
            Genre_Id: {
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
            tableName: 'Genre',
            timestamps: true,
        },
    );

    Genre.associate = (models: any) => {
        Genre.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return Genre;
};
