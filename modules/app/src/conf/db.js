require('dotenv').config();

module.exports = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'SequelizeMeta_core',
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeMeta_core',
};
