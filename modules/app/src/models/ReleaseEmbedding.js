module.exports = (sequelize, DataTypes) => {
    const ReleaseEmbedding = sequelize.define(
        'ReleaseEmbedding',
        {
            Release_Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            Embedding_Text: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            Embedding: {
                type: DataTypes.ARRAY(DataTypes.FLOAT),
                allowNull: false,
            },
            Embedded_At: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'ReleaseEmbedding',
            timestamps: false,
        },
    );

    ReleaseEmbedding.associate = (models) => {
        ReleaseEmbedding.belongsTo(models.Release, {
            foreignKey: 'Release_Id',
        });
    };

    return ReleaseEmbedding;
};
