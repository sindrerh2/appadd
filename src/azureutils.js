#!/usr/bin/env node
var request = require("request");

const dotenv = require('dotenv');
const uuidv1 = require('uuid/v1');
dotenv.config();
const IaC_tag = "IaC_appreg";

const app_uri = 'beta/applications'; // graph-kall mot alle apper i tenant
const users_uri = 'beta/users'; // graph-kall mot alle users i tenant 
const audience = 'https://graph.microsoft.com/';

async function callGraphAppCreate(access_token, display_name, redirect_urls, passwd, encKey) {
    let object_id = await getAppObjectId(display_name, access_token);
    console.log("display_name: " + display_name);
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
    console.log("callGraphAppCreate http method: " + http_method);
    console.log("callGraphAppCreate url: " + graph_url);
  
    var options = {
      method: http_method,
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token
      },
      json: {
        "displayName": display_name,
        "groupMembershipClaims": "SecurityGroup",
        web: {        
          implicitGrantSettings: {
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
            "type": "AsymmetricX509Cert",
            "usage": "Verify",
            "key": encKey,
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
        console.log("callGraphAppCreate response statuscode: " + response.statusCode);
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
  
  async function callGraphOwnerAdd(access_token, app_id, userprincipalName) {
    let user_object_id = await getUserObjectId(userprincipalName, access_token);
    let app_url = audience + app_uri + "/" + app_id + "/owners/$ref";
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
  
  async function getAppObjectId(appName, access_token) {
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
  
  function getAppId(appName, access_token) {
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
                resolve(jsonArray[i].appId);
              }
            }
          }
          resolve();
        }
      });
    })
  }
  
  async function getAppScopeId(appName, scopeName, access_token) {
    let http_method = 'GET';
    let app_obj_id = await getAppObjectId(appName, access_token);
    console.log("app_obj_id: " + app_obj_id);
    let graph_url = audience + app_uri + "/" + app_obj_id;
  
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
            if (JSON.parse(body).api != null){
              jsonArray = JSON.parse(body).api.oauth2PermissionScopes;
              console.log("jsonarray length: " + jsonArray.length);
              for (var i = 0; i < jsonArray.length; i++) {
                console.log( "Value: " + jsonArray[i].value);
                if (jsonArray[i].value == scopeName) {
                  console.log( "Scope_id (getAppScopeId): " + jsonArray[i].id);
                  resolve(jsonArray[i].id);
                }
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
/*     vaultClient.write('azuread/data/' + environment + "/config/" + appName, {data: { displayName: display_name, discoveryURL: discoveryURL }})
    .catch((err) => console.error(err.message)); */
  }
  
  async function callGraphScopeCreate(access_token, display_name, scope) {
    let object_id = await getAppObjectId(display_name, access_token);
    let appid = await getAppId(display_name, access_token);
    console.log("oid: " + object_id);
    console.log("appid: " + appid);
  
    let http_method = 'POST';
    let graph_url = audience + app_uri;
    let ident_uri = "api://" + appid;
    if (object_id != null) {
      //UPDATE
      http_method = 'PATCH';
      graph_url = graph_url + '/' + object_id;
    }
    let uuid = uuidv1();
    console.log("callGraphScopeCreate http method: " + http_method);
    console.log("callGraphScopeCreate url: " + graph_url);
    console.log("callGraphScopeCreate ident_uri: " + ident_uri);
    console.log("callGraphScopeCreate uuid: " + uuid);
  
    var options = {
      method: 'PATCH',
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token
      },
      json: {
        identifierUris: [
          ident_uri
        ],
        api: {
          "requestedAccessTokenVersion": null,
          "acceptMappedClaims": null,
          "knownClientApplications": [],
          "oauth2PermissionScopes": [
              { 
                "adminConsentDescription": "ad4",
                "adminConsentDisplayName": "ad4",
                "id": uuidv1(),
                "isEnabled": true,
                "type": "Admin",
                "userConsentDescription": null,
                "userConsentDisplayName": null,
                "value": scope
            }
          ]
        }
      }
    };
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        console.log("callGraphScopeCreate response statuscode: " + response.statusCode);
        if (error) {
          console.log("callGraphScopeCreate ERROR: " + error);
          reject(error);
        } else {
            console.log("callGraphScopeCreate " + http_method);
            resolve(object_id);
          }
        }
      );
    })
  }
  
  async function callGraphClientAppsAdd(access_token, appName, clientAppName, scopeName) {
  
    console.log("appName: " + appName);
    console.log("clientAppName: " + clientAppName);
    console.log("scopeName: " + scopeName);
  
  
    let object_id = await getAppObjectId(appName, access_token);
    let client_appid = await getAppId(clientAppName, access_token);
    let scope_id = await getAppScopeId(appName, scopeName, access_token)
  
    let graph_url = audience + app_uri+ '/' + object_id;;
      //UPDATE
    let http_method = 'PATCH';
    var options = {
      method: http_method,
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token
      },
      json: {
        api: {
          "preAuthorizedApplications": [
            {
              "appId": client_appid,
              "permissionIds": [
                scope_id
              ]
            }
          ]
        }
      }
    };
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        console.log("callGraphClientAppsAdd response statuscode: " + response.statusCode);
        if (error) {
          console.log("callGraphClientAppsAdd ERROR: " + error);
          reject(error);
        } else {
            console.log("callGraphClientAppsAdd UPDATE");
            resolve(object_id);
          }
        }
      );
    })
  }

  module.exports.getAccessToken = getAccessToken
  module.exports.callGraphAppCreate = callGraphAppCreate
  module.exports.callGraphScopeCreate = callGraphScopeCreate
  module.exports.callGraphClientAppsAdd = callGraphClientAppsAdd
  module.exports.addAppToVault = addAppToVault
  module.exports.callGraphOwnerAdd = callGraphOwnerAdd
  