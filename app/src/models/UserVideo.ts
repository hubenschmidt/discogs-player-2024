module.exports = (sequelize: any, DataTypes: any) => {
    const UserVideo = sequelize.define(
        'UserVideo',
        {
            User_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'User', key: 'User_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Video_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'Video', key: 'Video_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Play_Count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: 'UserVideo',
            timestamps: true,
            indexes: [
                { unique: true, fields: ['User_Id', 'Video_Id'] }, // prevent dup rows
            ],
        },
    );

    return UserVideo;
};
