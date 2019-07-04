#!/usr/bin/env node
var generatePassword = require("password-generator");
var request = require("request");
var forge = require("node-forge");
var certificateGenerator = require("./certificateGenerator.js");
var rsa = forge.pki.rsa;
var pki = forge.pki

const readFile = require('./readFile')
const mkVaultClient = require('./vaultClient')
const dotenv = require('dotenv');
dotenv.config();

//appgen id/secret
const client_id_Q = '161c5195-c597-42af-a089-75588b2aec8c';//(AppID appgen Q)
const client_secret_Q = process.env.client_secret_Q;
const tenantQ = '726d6769-7efc-4578-990a-f483ec2ec2d3';
const client_id_P = '161c5195-c597-42af-a089-75588b2aec8c';//(AppID appgen P)
const client_secret_P = process.env.client_secret_P;
const tenantP = '726d6769-7efc-4578-990a-f483ec2ec2d3';

const IaC_tag = "IaC_appreg";
const audience = 'https://graph.microsoft.com/';
const app_uri = 'beta/applications'; // graph-kall mot alle apper i tenant
const users_uri = 'beta/users'; // graph-kall mot alle users i tenant 

async function main() {

  let a_tokenQ = null;//await getAccessToken(client_id_Q, client_secret_Q, tenantQ);
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

    var passwd = generatePassword(30, false);
    var cert = certificateGenerator.getCert(appName, environment);
    var encKey = cert.pemCert_b64;
    var privKey = cert.pemPrivKey_b64;
    //let returnObj  = await callGraphAppCreate(a_token, appName, replyURLs, passwd, encKey);
    //let objectId = returnObj;
    //if (returnObj.appId != null) {
      console.log("Createing vault client...");
      const vaultClient = await mkVaultClient();
      console.log("...vault client created.");
      //addAppToVault(vaultClient, environment, appName, returnObj.appId, passwd, displayName, discoveryURL, privKey);
      addAppToVault(vaultClient, environment, appName, passwd, passwd, displayName, discoveryURL, privKey);
      //objectId = returnObj.id;
    //}   
    //for (var j = 0; j < owners.length; j++)
      //await callGraphOwnerAdd(a_token, objectId, app_uri, owners[j]);
  }

  //1. Claimspolicy
  //2. oppdater app med acceptmappedclaims = true
}

async function callGraphAppCreate(access_token, display_name, redirect_urls, passwd, encKey) {
  let object_id = await getAppObjectId(display_name, access_token);
  console.log("oid: " + object_id);

  var now = new Date();
  var nowPlus2Years = new Date();
  nowPlus2Years.setFullYear(now.getFullYear() + 2);

  let http_method = 'POST';
  let graph_url = audience + app_uri;
  if (object_id != null) {
    //UPDATE
    http_method = 'PATCH';
    graph_url = graph_url + '/' + object_id;
  }
  console.log("callGraphAppCreate1 " + http_method);
  console.log("callGraphAppCreate2 " + graph_url);

  //var enckey = certificateGenerator.getCert().enckey;

  var options = {
    method: http_method,
    url: graph_url,
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    json: {
      "displayName": display_name,
      "groupMembershipClaims": "SecurityGroup",
      web: {        implicitGrantSettings: {
          "enableIdTokenIssuance": true,
          "enableAccessTokenIssuance": false
        },
        "logoutUrl": "",
        "redirectUris": redirect_urls
      },
      passwordCredentials: [
        {
          "endDateTime": nowPlus2Years.toISOString(),
          "startDateTime": now.toISOString(),
          "secretText": passwd
        }
      ],
      keyCredentials: [
        {
          //"customKeyIdentifier": "303D36DDD6AAAD42821C52DEAB6335C3B402710A",
          //"customKeyIdentifier": "303D36DDD6AAAD42821C52DEAB6335C3B402710B",
          //"endDateTime": "2020-05-27T11:49:45Z",
          //"keyId": "054268b0-97c8-4819-9162-9c20f8fad052",
          //"keyId": "054268b0-97c8-4819-9162-9c20f8fad053",
          //"startDateTime": "2019-05-28T11:49:45Z",
          "type": "AsymmetricX509Cert",
          "usage": "Verify",
          "key": encKey,
          //"displayName": "C=SE"
        }
      ],
      //setter tilganger for appen
      requiredResourceAccess: [
        {
          "resourceAppId": "00000003-0000-0000-c000-000000000000",  //microsoft graph
          "resourceAccess": [
            {
              "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
              "type": "Scope"
            }
          ]
        }
      ],
      "tags": [IaC_tag],
    }
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      console.log("callGraphAppCreate3: " + response.statusCode);
      console.log("callGraphAppCreate4: " + body);
      if (error) {
        reject(error);
      } else {
        if (body != null) {
          //CREATE
          resolve(body);
        } else {
          //UPDATE
          resolve(object_id);
        }
      }
    });
  })
}

async function callGraphOwnerAdd(access_token, app_id, uri, userprincipalName) {
  let user_object_id = await getUserObjectId(userprincipalName, access_token);
  let app_url = audience + uri + "/" + app_id + "/owners/$ref";
  console.log(app_url);

  var options = {
    method: 'POST',
    url: app_url,
    headers: {
      Authorization: 'Bearer ' + access_token
    },
    json: {
      '@odata.id': audience + users_uri + '/' + user_object_id
    }
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        console.log("callGraphOwnerAdd " + response.statusCode);
        resolve();
      }
    });
  })
}

function getAppObjectId(appName, access_token) {
  let http_method = 'GET';
  let graph_url = audience + app_uri;

  var options = {
    method: http_method,
    url: graph_url,
    headers: {
      Authorization: 'Bearer ' + access_token
    },
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      console.log(response.statusCode);
      if (error) {
        reject(error);
      } else {
        if (body != null) {
          jsonArray = JSON.parse(body).value;
          for (var i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i].displayName == appName) {
              resolve(jsonArray[i].id);
            }
          }
        }
        resolve();
      }
    });
  })
}

function getUserObjectId(userPrincipalName, access_token) {
  let http_method = 'GET';
  let graph_url = audience + users_uri;

  var options = {
    method: http_method,
    url: graph_url,
    headers: {
      Authorization: 'Bearer ' + access_token
    },
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      console.log("getUserObjectId responsecode: " + response.statusCode);
      if (error) {
        reject(error);
      } else {
        if (body != null) {
          jsonArray = JSON.parse(body).value;
          for (var i = 0; i < jsonArray.length; i++) {
            if (jsonArray[i].userPrincipalName == userPrincipalName) {
              console.log("resolving:" + jsonArray[i].id)
              resolve(jsonArray[i].id);
            }
          }
        }
        resolve();
      }
    });
  })
}

function getAccessToken(client_id, client_secret, tenant) {
  var options = {
    method: 'POST',
    url: 'https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token',
    formData:
    {
      grant_type: 'client_credentials',
      client_secret: client_secret,
      scope: audience + '.default',
      client_id: client_id
    }
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        var bearer_token = JSON.parse(body);
        let a_token = bearer_token.access_token;
        resolve(a_token);
      }
    });
  })
}

function addAppToVault(vaultClient, environment, appName, clientId, passwd, display_name, discoveryURL, privkey){
  vaultClient.write('azuread/data/' + environment + "/creds/" + appName, {data: { client_id: clientId, client_secret: passwd, client_privkey_b64: privkey }})
  .catch((err) => console.error(err.message));
  vaultClient.write('azuread/data/' + environment + "/config/" + appName, {data: { displayName: display_name, discoveryURL: discoveryURL }})
  .catch((err) => console.error(err.message));
}

function testMotAura() {
  console.log("#### test mot vault #####");

  var options = {
    method: 'GET',
    url: 'https://vault.adeo.no',
  };
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        console.log("testmMotVault response " + response.statusCode);
        resolve();
      }
    });
  })
}

main();
//testMotAura();