'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1) Drop old FK (adjust name if different)
        await queryInterface
            .removeConstraint('History', 'history_release_id_fkey')
            .catch(() => {});

        // 2) Make column nullable
        await queryInterface.changeColumn('History', 'Release_Id', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        // 3) Re-add FK with SET NULL
        await queryInterface.addConstraint('History', {
            fields: ['Release_Id'],
            type: 'foreign key',
            name: 'history_release_id_fkey',
            references: { table: 'Release', field: 'Release_Id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },
};
