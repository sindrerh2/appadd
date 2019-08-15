#!/usr/bin/env node
var generatePassword = require("password-generator");
var certificateGenerator = require("./certificateGenerator.js");

const readFile = require('./readFile')
const mkVaultClient = require('./vaultClient')
const dotenv = require('dotenv');
dotenv.config();
const azureutils = require('./azureutils')

//appgen id/secret
const client_id_Q = '161c5195-c597-42af-a089-75588b2aec8c';//(AppID appgen Q)
const client_secret_Q = process.env.client_secret_Q;
const tenantQ = '726d6769-7efc-4578-990a-f483ec2ec2d3';
const client_id_P = '161c5195-c597-42af-a089-75588b2aec8c';//(AppID appgen P)
const client_secret_P = process.env.client_secret_P;
const tenantP = '726d6769-7efc-4578-990a-f483ec2ec2d3';

const app_uri = 'beta/applications'; // graph-kall mot alle apper i tenant

async function main() {

  let a_tokenQ = await azureutils.getAccessToken(client_id_Q, client_secret_Q, tenantQ);
  const fileQ = "./applicationsQ.yaml";

  addApplication(fileQ, a_tokenQ, "dev");

  /*   let a_tokenP = await getAccessToken(client_id_P, client_secret_P, tenantP);
    const fileP = "./applicationsP.yaml";
    addApplication(fileP, a_tokenP); */
}

async function addApplication(appInputFile, a_token, environment) {
  const file = appInputFile;
  const input = readFile({ file });

  for (var i = 0, len = input.Applications.length; i < len; i++) {
    const appName = input.Applications[i].name
    const replyURLs = input.Applications[i].replyURLs
    const owners = input.Applications[i].owners
    const displayName = input.Applications[i].displayName
    const discoveryURL = input.Applications[i].discoveryURL
    const scopes = input.Applications[i].scopes
    const clientapps = input.Applications[i].clientapps

    var passwd = generatePassword(30, false);
    var cert = certificateGenerator.getCert(appName, environment);
    var encKey = cert.pemCert_b64;
    var privKey = cert.pemPrivKey_b64;
    var returnObj  = await azureutils.callGraphAppCreate(a_token, appName, replyURLs, passwd, encKey);
    var objectId = returnObj;
    if (scopes != null) {
      for (var j = 0, length = scopes.length; j < length; j++) {
        console.log("Scope: " + scopes[j]);
        await azureutils.callGraphScopeCreate(a_token, appName, scopes[j])
      }
    }

    if(clientapps != null){
      for (var k = 0, length2 = clientapps.length; k < length2; k++) {
        console.log("#########clientapps.length: " + clientapps.length);
        //console.log("#########clientapps: " + clientapps[k].name);
        let client_scopes = clientapps[k].scopes;
        console.log("#########clientapps: " + clientapps[k].name);
        for (var l = 0, length3 = client_scopes.length; l < length3; l++) {
          console.log("clientapps: " + clientapps[k].name);
          console.log("#########client_scopes[l]: " + client_scopes[l]);
          await azureutils.callGraphClientAppsAdd(a_token, appName, clientapps[k].name, client_scopes[l]);
        }
      }
    }

    if (returnObj.appId != null) {
      const vaultClient = await mkVaultClient();
      azureutils.addAppToVault(vaultClient, environment, appName, returnObj.appId, passwd, displayName, discoveryURL, privKey);
      objectId = returnObj.id;
    }   
    for (var j = 0; j < owners.length; j++)
      await azureutils.callGraphOwnerAdd(a_token, objectId, owners[j]);
  }

  //1. Claimspolicy
  //2. oppdater app med acceptmappedclaims = true
}
main();