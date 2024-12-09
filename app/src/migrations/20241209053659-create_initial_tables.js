'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create User table
        await queryInterface.createTable('Users', {
            User_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Username: {
                type: Sequelize.STRING,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Collection table
        await queryInterface.createTable('Collections', {
            Collection_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'User_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Release table
        await queryInterface.createTable('Releases', {
            Release_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Date_Added: {
                type: Sequelize.DATE,
            },
            Thumb: {
                type: Sequelize.STRING,
            },
            Cover_Image: {
                type: Sequelize.STRING,
            },
            Title: {
                type: Sequelize.STRING,
            },
            Year: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Artist table
        await queryInterface.createTable('Artists', {
            Artist_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: Sequelize.STRING,
            },
            Date_Added: {
                type: Sequelize.DATE,
            },
            Release_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Releases',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Genre table
        await queryInterface.createTable('Genres', {
            Genre_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Release_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Releases',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Label table
        await queryInterface.createTable('Labels', {
            Label_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: Sequelize.STRING,
            },
            Release_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Releases',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Style table
        await queryInterface.createTable('Styles', {
            Style_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            Release_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Releases',
                    key: 'Release_Id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {},
};
