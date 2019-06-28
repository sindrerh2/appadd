const vault = require('node-vault');

async function getToken() {
    ['VAULT_ADDR', 'role_id', 'secret_id'].forEach(env => {
        if (!process.env[env]) {
            throw new Error(`The environment variable ${env} is not set.`);
        }
    });

    const options = {
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR
    };
    let login_result = await vault(options).approleLogin({ role_id: process.env.role_id, secret_id: process.env.secret_id }).catch(err => console.error(err));
    console.log(login_result);
    return login_result.auth.client_token;
};
module.exports.getToken = getToken