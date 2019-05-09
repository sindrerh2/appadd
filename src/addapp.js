var generatePassword = require("password-generator");
var request = require("request");

//appgen id/secret
const client_id = '161c5195-c597-42af-a089-75588b2aec8c';//(AppID appgen)

const dotenv = require('dotenv');
dotenv.config();

const IaC_tag = process.env.IAC_TAG;
const client_secret = process.env.client_secret;

let tenant = '726d6769-7efc-4578-990a-f483ec2ec2d3';
let app_uri1 = 'beta/applications/32852911-e91f-4f26-aa89-787c41ca6abc'; //graph-kall mot samme app som token ble generert for (OID appgen)
const app_uri = 'beta/applications'; // graph-kall mot alle apper i tenant 
let app_uri3 = 'beta/applications/014ab7db-7b0a-4646-ae47-5cef1379e908'; //graph-kall mot annen app enn token er generert for (OID app1)
let owner_uri = 'beta/applications/134a74a2-4a77-40d3-8f83-db9b81c1e409/owners'; //test
//let audience = 'https://graph.windows.net/';//azure ad graph
let audience = 'https://graph.microsoft.com/';//microsoft graph
let test_owners_pn_2 = ['username2@sindretest.onmicrosoft.com', 'username1@sindretest.onmicrosoft.com'];//testowners
let test_redirects2 = ["http://localhost:8080/auth/openid/callback", "http://localhost:8080/auth/openid/callback2"];//testredirects2
let test_redirects = ["http://localhost:8080/auth/openid/callback"];//testredirects

console.log("Your IaCtag is " +  IaC_tag);
console.log("Your cs is " +  client_secret);


 async function main(){

    let a_token = await getAccessToken(client_id, client_secret);
    let appl_id = await callGraphAppCreate(a_token, "app12", test_redirects2);
    for (var i = 0; i < test_owners_pn_2.length; i++)
      callGraphOwnerAdd(a_token, appl_id, app_uri, test_owners_pn_2[i]);

    //1. Claimspolicy
    //2. oppdater app med acceptmappedclaims = true
    //3. Sendt secret til vault
    //console.log(body.id);
    //callGraphAppUpdate("app21", a_token, app_uri2, test_owners, 'dc0cf3cc-d210-4ef7-bb27-6b3fd02033d8',callGraphOwnerAdd);
    
    //callGraphOwnerAdd(a_token, 'fdae8b02-1f3e-46d9-8425-0881b89257a8', app_uri2);//object_id
    //callGraphOwnerAdd(a_token, '12375188-7047-49f4-8d09-28cf177894cd', app_uri2);//application_id
}

function getAccessToken(client_id, client_secret){
  var options = { method: 'POST',
  url: 'https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token',
  formData: 
   { grant_type: 'client_credentials',
     client_secret: client_secret,
     scope: audience + '.default',
     client_id: client_id } };

     return new Promise(function(resolve, reject) {
      request(options, function (error, response, body) {
        if(error) {
          reject(error);
        } else {
          var bearer_token = JSON.parse(body);  
          let a_token = bearer_token.access_token;
          resolve(a_token);
        }
      });
    })  
}

async function callGraphAppCreate(access_token, display_name, redirect_urls) {
  console.log(access_token);
  console.log(display_name);
  console.log(redirect_urls);
  let object_id = await getAppObjectId(display_name, access_token);
  console.log(object_id);

  var now = new Date();
  var nowPlus2Years = new Date();
  nowPlus2Years.setFullYear(now.getFullYear() + 2);

  var passwd = generatePassword(30, false);
  
  let http_method = 'POST';
  let graph_url = audience + app_uri;
  if(object_id != null){
    //UPDATE
    http_method = 'PATCH';
    graph_url = graph_url + '/' + object_id;
  }

  console.log("passwd " + passwd);
  console.log("callGraphAppCreate " + http_method);
  console.log("callGraphAppCreate " + graph_url);
  
  var options = { method: http_method,
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token },
      json:{
        "displayName": display_name,
        "groupMembershipClaims": "SecurityGroup",
        web:{
          implicitGrantSettings: {
            "enableIdTokenIssuance": true,
            "enableAccessTokenIssuance": true },
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

  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      console.log("callGraphAppCreate: " + response.statusCode);
      if(error) {
        reject(error);
      } else {
        if (body != null){
          //CREATE
          resolve(body.id);
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
  var options = { method: 'POST',
      url: app_url,
      headers: {
        Authorization: 'Bearer ' + access_token},
      json: {
        '@odata.id': 'https://graph.microsoft.com/beta/users/' + user_object_id}
  };

  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      if(error) {
        reject(error);
      } else {
        console.log("callGraphOwnerAdd " + response.statusCode);
        resolve();
      }
    });
  })
}

function getAppObjectId(appName, access_token){

  let http_method = 'GET';
  let graph_url = audience + app_uri;
  
  var options = { method: http_method,
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token },
  };

  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      console.log(response.statusCode);
      if(error) {
        reject(error);
      } else {
        if (body != null){
          jsonArray = JSON.parse(body).value;
          for(var i = 0; i < jsonArray.length; i++)
          {
            if(jsonArray[i].displayName == appName) //&& jsonArray[i].tags.includes(IaC_tag))
            {
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

function getUserObjectId(userPrincipalName, access_token){

  let http_method = 'GET';
  let graph_url = 'https://graph.microsoft.com/beta/users';
  
  var options = { method: http_method,
      url: graph_url,
      headers: {
        Authorization: 'Bearer ' + access_token },
  };

  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      console.log(response.statusCode);
      if(error) {
        reject(error);
      } else {
        if (body != null){
          //console.log(body);
          jsonArray = JSON.parse(body).value;
          for(var i = 0; i < jsonArray.length; i++)
          {
            if(jsonArray[i].userPrincipalName == userPrincipalName)
            {
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

main();