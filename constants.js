'use strict';

var path = require('path');
module.exports.FRONTEND_PATH = path.normalize(__dirname + '/frontend');
module.exports.BACKEND_PATH = path.normalize(__dirname + '/frontend');

//testing paths
module.exports.ROUTES = {
	v0: {
		GET: {
			GETCONFIG 		: "/api/getconfig/",
			GETCONFIGS 		: "/api/getconfigs/",
			GETNEWVERSION 	: "/api/getnewversion/",
			GETACTIVECONFIG	: "/api/getactiveconfig/",
			ACTIVATE		: "/api/activate/"
		},
		POST:{
			CREATECONFIG	: "/api/createconfig"
		}
	},
	v1: "/api/vf-os-enabler/v1/enabler",
	v2: "/api/vf-os-enabler/v2/enabler"
}