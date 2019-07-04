const vault = require('node-vault');
//const vaultToken = require("./vaultToken.js");
module.exports = async () => {
    
    let token = await vaultToken.getToken();
    if (token != null){
        process.env.VAULT_TOKEN = token;
    }
    
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