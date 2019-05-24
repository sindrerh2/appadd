const vault = require('node-vault');

process.env.DEBUG = 'node-vault';

module.exports = () => {
    ['VAULT_ADDR', 'VAULT_TOKEN'].forEach(env => {
        if (!process.env[env]) {
            throw new Error(`The environment variable ${env} is not set.`);
        }
    });

    const options = {
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR,
        token: process.env.VAULT_TOKEN
    };

    return vault(options);
};