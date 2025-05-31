'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('User', {
            User_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            OAuth_Access_Token: {
                type: Sequelize.STRING,
            },
            OAuth_Access_Token_Secret: {
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

        await queryInterface.createTable('RequestToken', {
            OAuth_Request_Token: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            OAuth_Request_Token_Secret: {
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

        await queryInterface.createTable('Collection', {
            Collection_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            User_Id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'User',
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

        await queryInterface.createTable('Release', {
            Release_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
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

        await queryInterface.createTable(
            'ReleaseCollection',
            {
                Release_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Release',
                        key: 'Release_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                Collection_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Collection',
                        key: 'Collection_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                uniqueKeys: {
                    unique_release_collection: {
                        fields: ['Release_Id', 'Collection_Id'],
                    },
                },
            },
        );

        await queryInterface.createTable('Artist', {
            Artist_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            Name: {
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

        await queryInterface.createTable(
            'ReleaseArtist',
            {
                Release_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Release',
                        key: 'Release_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                Artist_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Artist',
                        key: 'Artist_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                uniqueKeys: {
                    unique_release_label: {
                        fields: ['Release_Id', 'Artist_Id'],
                    },
                },
            },
        );

        await queryInterface.createTable('Label', {
            Label_Id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            Name: {
                type: Sequelize.STRING,
            },
            Cat_No: {
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

        await queryInterface.createTable(
            'ReleaseLabel',
            {
                Release_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Release',
                        key: 'Release_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                Label_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Label',
                        key: 'Label_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                uniqueKeys: {
                    unique_release_artist: {
                        fields: ['Release_Id', 'Label_Id'],
                    },
                },
            },
        );

        await queryInterface.createTable('Genre', {
            Name: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
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

        await queryInterface.createTable(
            'ReleaseGenre',
            {
                Release_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Release',
                        key: 'Release_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                Genre_Name: {
                    type: Sequelize.STRING,
                    references: {
                        model: 'Genre',
                        key: 'Name',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                uniqueKeys: {
                    unique_release_genre: {
                        fields: ['Release_Id', 'Genre_Name'],
                    },
                },
            },
        );

        await queryInterface.createTable('Style', {
            Name: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
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

        await queryInterface.createTable(
            'ReleaseStyle',
            {
                Release_Id: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: 'Release',
                        key: 'Release_Id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                Style_Name: {
                    type: Sequelize.STRING,
                    references: {
                        model: 'Style',
                        key: 'Name',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                uniqueKeys: {
                    unique_release_style: {
                        fields: ['Release_Id', 'Style_Name'],
                    },
                },
            },
        );
    },

    down: async (queryInterface, Sequelize) => {},
};
