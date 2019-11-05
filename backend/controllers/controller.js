//controller version 1

var configModel = require('../models/config.js');
var logger		= require('../../config/logger.js');
var mongoose	= require('mongoose');


module.exports.log = function(req,res,next){
	logger.info("Request type:",req.method, "Request URL:", req.originalUrl, "Payload:", req.body);
    next();
}

module.exports.create = function(req,res){
	var handler = "backend.controller.create";
	logger.info("starting",handler);
	//grab the config model
	var newconfig = new configModel({
		version : parseInt(req.body.version, 10),
		enablerid : req.body.enablerid,
		active : req.body.active,
		parent : req.body.parent,
		comment : req.body.comment,
		body : req.body.body,
		created_at : new Date()
	});
	query('save',newconfig,function(response){
		if(response.result == 'error'){
			logger.error(handler, result);
			res.writeHead(500);
			return res.end();
			throw result;
		}else{
			logger.info(handler,response)
			res.writeHead(200, {'Content-type': 'application/json'});
			return res.end();
		}
	})
}

module.exports.getconfig = function(req,res){
	var handler = "backend.controller.getconfig";
	logger.info("starting",handler);
	query('find',{enablerid: req.params.enablerid, version: req.params.version},function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			res.writeHead(200, {'Content-type': 'application/json'});
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}

module.exports.getconfigs = function(req,res){
	var handler = "backend.controller.getconfigs";
	logger.info("starting",handler);
	query('find',{enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			res.writeHead(200, {'Content-type': 'application/json'});
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}

module.exports.getnewversion = function(req,res){
	var handler = "backend.controller.getnewversion";
	logger.info("starting",handler);
	var max = 1;
	query('find', {enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			res.writeHead(500);
			logger.info(handler, response);
			return res.end();
		}else{
			try {
				response.documents.forEach(function(eachConfig){
					if (eachConfig.version > max){
						max = eachConfig.version
					}
				})
				var response = {result: 'success', documents: {version: max+1}}
				logger.info(handler,response)
				res.writeHead(200, {'Content-type': 'application/json'});
				res.write(JSON.stringify(response))
				return res.end();
			}catch(e){
				logger.error(handler, e);
				throw e;
			}
		}
	})
}


module.exports.getactiveconfig = function(req,res){
	var handler = "backend.controller.getactiveconfig";
	logger.info("starting",handler);

	query('find', {enablerid: req.params.enablerid, active: true}, function(response){
		if(response.result == 'error'){
			res.writeHead(500);
			logger.info(handler, response);
			return res.end();
		}else{
			res.writeHead(200, {'Content-type': 'application/json'});
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}

module.exports.activate = function(req,res){
	var handler = "backend.controller.activate";
	logger.info("starting",handler);
	
	query('find',{enablerid: req.params.enablerid, active: true}, function(response){
		if(response.result == 'error'){
			res.writeHead(500);
			logger.error(handler, response);
			return res.end();
		}else{
			//check if we have found an active configuration
			if (response.documents.length == 0){
				logger.info(handler, 'there is no active configuration');
				logger.info(handler, 'activating configuration number ', req.params.version);
				//activate configuration
				query('find', {enablerid: req.params.enablerid, version: req.params.version}, function(response){
					if (response.result == 'error'){
						res.writeHead(500);
						logger.error(handler, response);
						return res.end();
					}else{
						response.documents[0].active = true;
						query('save', response.documents[0], function(response){
							if(response.result == 'error'){
								res.writeHead(500);
								logger.error(handler, response);
								return res.end();
							}else{
								res.writeHead(200, {'Content-type': 'application/json'});
								var response = {result: 'success'};
								res.write(JSON.stringify(response));
								logger.info(handler,response);
								return res.end();
							}
						})
					}
				})
			}else{
				response.documents[0].active = false;
				query('save',response.documents[0],function(response){
					if(response.result == 'error'){
						res.writeHead(500);
						logger.error(handler, response);
						return res.end();
					}else{
						query('find',{enablerid: req.params.enablerid, version: req.params.version}, function(response){
							if (response.result == 'error'){
								res.writeHead(500);
								logger.error(handler, response);
								return res.end();
							}else{
								response.documents[0].active = true;
								query('save',response.documents[0], function(response){
									if(response.result == 'error'){
										res.writeHead(500);
										logger.error(handler, response);
										return res.end();
									}else{
										res.writeHead(200, {'Content-type': 'application/json'});
										var response = {result: 'success'};
										res.write(JSON.stringify(response));
										logger.info(handler,response);
										return res.end();
									}
								})
							}
						})
					}
				})
			}
		}
	})
}

function query(type, queryJSON, callback){
	//type: save, find
	var handler = "backend.controller.query";
	logger.info("starting", handler);
	//result: 'type', documents: [mongo documents]
	//result's types: error, success
	var response = {
		result: "",
		documents: ""
	}
	//check db connection in first place
	if(mongoose.connection.readyState == 0){
		logger.error(handler, "mongoose is disconnected");
		response.result = 'error';
		callback(response)
	}else{
		switch(type){
			case 'save':
				queryJSON.save(function(err){
					if(err){
						logger.error(handler, err);
						response.result = 'error';
						response.documents = err;
						callback(response);
					}else{
						response.result = 'success';
						logger.info(handler, response);
						callback(response);
					}
				})
				break;
			case 'find':
				configModel.find(queryJSON, function(err,documents){
					if(err){
						logger.error(handler, err);
						response.result = 'error';
						response.documents = err
						callback(response);
						throw err;
					}else{
						response.result = 'success';
						response.documents = documents;
						logger.info(handler, response);
						callback(response);
					}
				})
				break;
			default:
				response.result = 'error';
				response.documents = 'bad query type';
				logger.info("backend.controller.query bad query type");
				callback(response);
		}
	}
}



