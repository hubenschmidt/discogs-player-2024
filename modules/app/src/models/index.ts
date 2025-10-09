'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);

// Load the env-specific config from conf/db.js
const env = process.env.NODE_ENV || 'development';
const allConfigs = require('../conf/db.js');
const dbConfig = allConfigs[env];

if (!dbConfig) {
    throw new Error(`Sequelize config missing for env "${env}" in conf/db.js`);
}

let sequelize: any;

// If using DATABASE_URL (use_env_variable), pass the URL + options
if (dbConfig.use_env_variable) {
    const url = process.env[dbConfig.use_env_variable];

    sequelize = new Sequelize(url, dbConfig);
} else {
    // Otherwise pass discrete fields (must include dialect)
    sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        dbConfig,
    );
}

const db: { [key: string]: any } = {};

fs.readdirSync(__dirname)
    .filter(
        (file: string) =>
            file.indexOf('.') !== 0 &&
            file !== basename &&
            (file.endsWith('.ts') || file.endsWith('.js')) &&
            !file.endsWith('.test.ts'),
    )
    .forEach((file: string) => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
