'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(
            'CREATE EXTENSION IF NOT EXISTS vector',
        );

        await queryInterface.createTable('ReleaseEmbedding', {
            Release_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: { model: 'Release', key: 'Release_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Embedding_Text: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            Embedding: {
                type: 'vector(3072)',
                allowNull: false,
            },
            Embedded_At: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('ReleaseEmbedding');
        await queryInterface.sequelize.query(
            'DROP EXTENSION IF EXISTS vector',
        );
    },
};
