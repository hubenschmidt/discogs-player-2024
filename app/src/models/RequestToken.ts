module.exports = (sequelize: any, DataTypes: any) => {
    const RequestToken = sequelize.define(
        'RequestToken',
        {
            OAuth_Request_Token: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            OAuth_Request_Token_Secret: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: 'RequestToken',
            timestamps: true,
        },
    );

    return RequestToken;
};
