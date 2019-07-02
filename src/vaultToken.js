const vault = require('node-vault');
//require('https').globalAgent.options.ca = require('ssl-root-cas').create();

async function getToken() {
    ['VAULT_ADDR', 'AZURE_IAC_APPROLE_USR', 'AZURE_IAC_APPROLE_PSW'].forEach(env => {
        if (!process.env[env]) {
            throw new Error(`The environment variable ${env} is not set.`);
        }
    });

    const options = {
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR
    };
    let login_result = await vault(options).approleLogin({ role_id: process.env.AZURE_IAC_APPROLE_USR, secret_id: process.env.AZURE_IAC_APPROLE_PSW }).catch(err => console.error(err));
    //console.log(login_result);
    return login_result.auth.client_token;
};
module.exports.getToken = getToken
