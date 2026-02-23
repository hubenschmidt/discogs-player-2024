'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ChatSession', {
            ChatSession_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'User', key: 'User_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        await queryInterface.createTable('ChatMessage', {
            ChatMessage_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ChatSession_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ChatSession', key: 'ChatSession_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Role: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Content: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            Tool_Calls: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            Tool_Call_Id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        await queryInterface.createTable('StagedPlaylist', {
            StagedPlaylist_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            ChatSession_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'ChatSession', key: 'ChatSession_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            User_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'User', key: 'User_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            Status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'draft',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        await queryInterface.createTable('StagedPlaylistVideo', {
            StagedPlaylistVideo_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            StagedPlaylist_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'StagedPlaylist', key: 'StagedPlaylist_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Video_Id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Video', key: 'Video_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            Release_Id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'Release', key: 'Release_Id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            Position: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            AI_Rationale: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('StagedPlaylistVideo');
        await queryInterface.dropTable('StagedPlaylist');
        await queryInterface.dropTable('ChatMessage');
        await queryInterface.dropTable('ChatSession');
    },
};
