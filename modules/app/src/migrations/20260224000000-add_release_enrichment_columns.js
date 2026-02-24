'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Release', 'Notes', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('Release', 'Country', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Release', 'Tracklist', {
            type: Sequelize.JSONB,
            allowNull: true,
        });
        await queryInterface.addColumn('Release', 'Extraartists', {
            type: Sequelize.JSONB,
            allowNull: true,
        });
        await queryInterface.addColumn('Release', 'Enriched_At', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Release', 'Enriched_At');
        await queryInterface.removeColumn('Release', 'Extraartists');
        await queryInterface.removeColumn('Release', 'Tracklist');
        await queryInterface.removeColumn('Release', 'Country');
        await queryInterface.removeColumn('Release', 'Notes');
    },
};
