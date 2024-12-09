module.exports = (sequelize: any, DataTypes: any) => {
    const Artist = sequelize.define('Artist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        date_added: {
            type: DataTypes.DATE,
        },
    });

    return Artist;
};
