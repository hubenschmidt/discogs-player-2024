'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require('../conf/db.js');

const db: { [key: string]: any } = {};
const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
});

console.trace('begin DB sync....');

fs.readdirSync(__dirname)
    .filter((file: string) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            (file.endsWith('.ts') || file.endsWith('.js')) &&
            !file.endsWith('.test.ts')
        );
    })
    .forEach((file: string) => {
        console.log('Loading model:', file);

        // Use require directly for `module.exports`
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        console.log('debug model', model);
        db[model.name] = model;
        console.log('debug model', db[model.name]);
    });

console.trace('check DB sync', db);

Object.keys(db).forEach(modelName => {
    console.trace('Associating model:', modelName);
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
