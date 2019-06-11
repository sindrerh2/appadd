var forge = require("node-forge");
var pki = forge.pki

function getCert(appname, env) {
    
    var attrs = [{
        shortName: 'OU',
        value: env
    }, {
        shortName: 'OU',
        value: 'AAD_IaC_generated_cert'
    }, {
        name: 'commonName',
        value: appname
    }];
    
    var keypair = pki.rsa.generateKeyPair(2048);
    
    var cert = pki.createCertificate();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    cert.publicKey = keypair.publicKey;
    //cert.serialNumber = '03';
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    var privKey = keypair.privateKey;

    cert.sign(keypair.privateKey);
    var pemPrivKey_b64 = forge.util.encode64(pki.privateKeyToPem(privKey));

    var pemcert = pki.certificateToPem(cert);
    var pemCert_b64 = forge.util.encode64(pemcert);

    return {pemCert_b64, pemPrivKey_b64};
    
};
module.exports.getCert = getCert