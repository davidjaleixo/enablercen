## Configurator Enabler
### Read me

#### 1. Prerequisite for Multi-container docker application

In order to run this enabler code on your local machine you should have Docker installed.
Please refer to [Docker](http://docker.com) for detailed installation instructions

#### 2. Instalation

Make sure the Docker is installed on your  environment:
`docker --version`

Please note that functional tests were performed using the following versions:
`Docker version 17.05.0-ce, build 89658be` 
and
`docker-compose version 1.21.2, build a133471`

##### 2.1 - Clone the repository
Clone this repository by executing the following command:
`git clone https://<username>@opensourceprojects.eu/git/p/vfos/assets/enablers/cen/code vfos-assets-enablers-cen-code`

##### 2.2 - Run multi-container Docker application

This multi-container Docker application is composed by two services: `enabler` and `mongo` as it's configured in `docker-compose.yml`.

Navigate to the cloned directory (vfos-assets-enablers-cen-code if you didn't changed the 2.1 command)and execute `docker-compose up --build` to startup the multi-container enabler on background.

Check if services are up and running by executing the command:
`docker ps -q -f name=configurationenabler`

#### 4. Usage

Whenever it's needed to have this enabler runnig, please execute `docker-compose up`.

Using your favorite web browser please navigate to `localhost:3000` to reach the frontend module.
Please note that <localhost> it's related to the Docker environment which you are using.

The following Frontend endpoints are now available:
`localhost:3000`
`localhost:3000/manage/<enabler_id>`
`localhost:3000/config/v2/<enabler_id`

For tests purposes `<enabler_id>` could be any wanted String.

##### 4.1 - Docker logs

For troubleshoot purposes, logs can be reached by using:
`docker logs configurationenabler`

##### 4.2 - Service enabler logs

The enabler service provides specific logs which you can find inside the Docker container.

`docker exec -it configurationenabler bash`

Then you can tail the log file by executing:

`tail -f configurator.log`



#### 3. API
API latest version is <v2>. To use it please replace `<api_version>` with `v2`


## vf-OS Enablers

### Enabler 1 - Get all Enabler's Configurations

```http
GET /api/vf-os-enabler/v2/enabler/1 HTTP/1.1
Accept: */*
```

```http
HTTP/1.1 200 OK
Content-type: application/json
X-Powered-By: Express
Date: Tue, 29 Aug 2017 11:04:31 GMT
Connection: keep-alive
Transfer-Encondig: chunked

{
	result: "success",
	documents: [
	{
		_id: "5988518d34cfea1307ecf296",
		__v: 0,
		created_at: "2017-08-07T11:39:57.094Z",
		body: [
			{"mongoport":"123"}
		],
		comment: "This is the first config version",
		parent: null,
		active: false,
		enablerid: "1",
		version: 1
	},{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2
	}]
}
```

Use this API call whenever is needed to retrieve all configurations related to one enabler.  

#### Request
`GET /api/vf-os-enabler/<api_version>/enabler/<enabler_id>/configurations`

#### URL Parameters

Resource Parameter | Description
---- | ----
api_version | Identifies the API version that will be used for the request
enabler_id | Identifies the Enabler from the enablers pool

#### Return Payload

The API response will contain a JSON document with the property `result`: **success**, **error** or **empty** and the `documents` with the enabler's configurations (if found).

In the following Example it's queried all configurations related to enabler id `1`:


```json
{
	result: "success",
	documents: [
	{
		_id: "5988518d34cfea1307ecf296",
		__v: 0,
		created_at: "2017-08-07T11:39:57.094Z",
		body: [
			{"mongoport":"123"}
		],
		comment: "This is the first config version",
		parent: null,
		active: false,
		enablerid: "1",
		version: 1,
		configname: "myconfigname",
		path: "this/is/my/path"
	},{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2,
		configname: "myconfigname",				path: "this/is/my/path"
	}]
}
```

#### Return Codes
Code | Description
--- | ---
200 | Configurations found
404 | Configurations not found
422 | Unprocessable entity if the filter is not set in the write way
500 | Internal Server Error - There was an unexpected error at some point during the processing of the request.



### Enabler 1 - Get Enabler's specific configuration name

```http
GET /api/vf-os-enabler/v2/enabler/1/myconfigname HTTP/1.1
Accept: */*
```

```http
HTTP/1.1 200 OK
Content-type: application/json
X-Powered-By: Express
Date: Tue, 29 Aug 2017 11:04:31 GMT
Connection: keep-alive
Transfer-Encondig: chunked

{
	result: "success",
	documents: [
	{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		nesting: [2,3],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2,
		configname: "myconfigname",				path: "this/is/my/path"
		
	}]
}
```
Use this API call whenever is needed to retrieve one single configuration by a given configuration name. Note that each configuraiton version can have nested configurations. For example the Configuration version 3 can have nested the configuration version 1 and 2, which means all the key-value pair from version 1 and 2 will be present on the version 3.

#### Request
`GET /api/vf-os-enabler/<api_version>/enabler/<enabler_id>/<configuration_name>`


#### URL Parameters

Resource Parameter | Description
---- | ----
api_version | Identifies the API version that will be used for the request
enabler_id | Identifies the Enabler from the enablers pool
configuration_name | Identifies the configuration name from the configurations pool

#### Query Parameters
Parameter | Description
---- | ----
resolvenesting | Query parameter set to `true` to resolve the version nested

#### Return Payload

The API response will contain a JSON document with the query result: `success`, `error` or `empty` and the `documents` with the enabler's configuration queried.

In the following Example it's queried the configuration name `myconfigname` for the enabler id `1` :

```json
{
	result: "success",
	documents: [
	{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		nesting: [2,3],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2,
		configname: "myconfigname",				path: "this/is/my/path"
	}]
}
```

#### Return Codes

Code | Description
---- | ----
200 | Configuration Found
404 | Configuration Not Found
500 | Internal Server Error - There was an unexpected error at some point during the processing of the request.


### Enabler 1 - Get Enabler's specific configuration name and version

```http
GET /api/vf-os-enabler/v2/enabler/1/myconfigname/2 HTTP/1.1
Accept: */*
```

```http
HTTP/1.1 200 OK
Content-type: application/json
X-Powered-By: Express
Date: Tue, 29 Aug 2017 11:04:31 GMT
Connection: keep-alive
Transfer-Encondig: chunked

{
	result: "success",
	documents: [
	{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2,
		configname: "myconfigname",				path: "this/is/my/path"
		
	}]
}
```
Use this API call whenever is needed to retrieve one single configuration by a given configuration name and version.

#### Request
`GET /api/vf-os-enabler/<api_version>/enabler/<enabler_id>/<configuration_name>/<configuration_version>`


#### URL Parameters

Resource Parameter | Description
---- | ----
api_version | Identifies the API version that will be used for the request
enabler_id | Identifies the Enabler from the enablers pool
configuration_name | Identifies the configuration name from the configurations pool
configuration_version | Identifies the configuration version from the configurations pool with the same configuration' name

#### Return Payload

The API response will contain a JSON document with the query result: `success`, `error` or `empty` and the `documents` with the enabler's configuration queried.

In the following Example it's queried the configuration version `2` from the configuration name `myconfigname` for the enabler id `1` :

```json
{
	result: "success",
	documents: [
	{
		_id: "2008518d34cfea1307rty876",
		__v: 0,
		created_at: "2017-08-07T12:00:00.000Z",
		body: [
			{"mongoport":"123"},
			{"loglevel":"debug"}
		],
		comment: "This is the second config version based on the previous one",
		parent: 1,
		active: true,
		enablerid: "1",
		version: 2,
		configname: "myconfigname",				path: "this/is/my/path"
	}]
}
```

#### Return Codes

Code | Description
---- | ----
200 | Configuration Found
404 | Configuration Not Found
500 | Internal Server Error - There was an unexpected error at some point during the processing of the request.

### Enabler 1 - Create Enabler Configuration

```http
POST /api/vf-os-enabler/v1/enabler/1/configurations/ HTTP/1.1
Accept: */*
Content-Type: application/json; charset=utf-8

{"version":3, "active":false, "parent":null, "enablerid":"1","comment":"This is the third config version", "body":[{"my_key":"my_value"}]}
```

```http
HTTP/1.1 200 OK
Content-type: application/json
X-Powered-By: Express
Date: Tue, 29 Aug 2017 15:00:00 GMT
Connection: keep-alive
Transfer-Encondig: chunked

{"result":"success"}
```

Use this API call whenever is needed to create a new configuration version for one enabler.

#### Request
`POST /api/vf-os-enabler/<api_version>/enabler/<enabler_id>/configurations`

#### URL Parameters

Resource Parameter | Description
---- | ----
api_version | Identifies the API version that will be used for the request
enabler_id | Identifies the Enabler from the enablers pool

#### JSON Body Payload

Name | Required | Type | Description
---- | ---- | ---- | ---
version | No | String | The configuration version that will be created. Example: 2
parent |  Yes | String | For historical purposes the parameter represents the version of the parent configuration file which the new one is based on. Example: 10
enablerid | Yes |  String | Enabler identification which the new configuration to be created belongs to. Example: ABC123
comment | Yes | String | 	Configuration comment. Example: Base version
body | Yes | JSON | JSON document where the custom configuration parameters are. Example: {"mongoport" : "123"}

#### Return Payload

The API response will contain a JSON document with the query result: `success` or `error`.

Example:

```json
{
	result: "success"
}
```

#### Return Codes
Code | Description
---- | ----
201 | Configuration created successfully
500 | Internal Server Error - There was an unexpected error at some point during the processing of the request.

### Powered by:

![alt text](https://static.wixstatic.com/media/d65bd8_d460ab5a6ff54207a8ac3e7497af18c4~mv2_d_4201_2594_s_4_2.png "Configurator Enabler")