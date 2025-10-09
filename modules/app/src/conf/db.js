require('dotenv').config();

const base = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
};

const sslDialectOptions = { ssl: { require: true, rejectUnauthorized: false } };

module.exports = {
    development: {
        ...base, // local compose on 5432, usually no SSL
    },
    production: process.env.DATABASE_URL
        ? {
              use_env_variable: 'DATABASE_URL', // Sequelize/CLI reads from .env
              dialect: 'postgres',
              logging: false,
              dialectOptions: sslDialectOptions,
          }
        : {
              ...base,
              port: Number(process.env.DB_PORT || 25060),
              dialect: 'postgres',
              logging: false,
              dialectOptions: sslDialectOptions,
          },
};
