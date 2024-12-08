module.exports = (sequelize: any, DataTypes: any) => {
    const Release = sequelize.define('Release', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        date_added: {
            type: DataTypes.DATE,
        },
    });

    return Release;
};
