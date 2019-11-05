//controller V1

var configModel = require('../models/config.js');
var logger		= require('../../config/logger.js');
var mongoose	= require('mongoose');


var hasEnablerID = function(req){
	return (req.query.enablerid ? true : false)
}
var hasVersion = function(req){
	return (req.query.version ? true : false)
}
var hasActive = function(req){
	return (req.query.active ? true : false)
}
var hasActivate = function(req){
	return (req.query.activate ? true : false)
}
var hasFilter = function(req){
	return (req.query.filter ? true : false)
}

module.exports.patchCollection = function(req,res){
	var handler = "backend.v1.patch";
	logger.info("starting", handler);
	req.body.forEach(function(eachCollection){
		switch(eachCollection.o){
			case 'replace':
				activateConfig(req,res)
				break;
			default:
				res.writeHead(400);
				return res.end();
				break;
		}
	})
}

module.exports.getVersion = function(req,res){
	var handler = "backend.v1.getVersion";
	logger.info("starting",handler);
	//filter checker:
	//if (hasActivate(req) && req.query.activate == 'true'){
	//	activateConfig(req,res);
	//}else{
		query('find',{enablerid: req.params.enablerid, version: req.params.version},function(response){
			if(response.result == 'error'){
				logger.error(handler, response);
				res.writeHead(500);
				return res.end();
			}else{
				if(response.result == 'empty'){
					res.writeHead(404);
				}else{
					res.writeHead(200, {'Content-type': 'application/json'});
					
				}
				res.write(JSON.stringify(response));
				logger.info(handler,response);
				return res.end();
			}
		})
	//}
}
var getAllConfigs = function(req,res){
	var handler = "backend.v1.getAllConfigs";
	logger.info("starting",handler);
	query('find',{enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			if (response.result == 'empty'){
				res.writeHead(404);
			}else{
				res.writeHead(200, {'Content-type': 'application/json'});	
			}
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}
var getActiveConfig = function(req,res){
	var handler = "backend.v1.getActiveConfig";
	logger.info("starting",handler);

	query('find', {enablerid: req.params.enablerid, active: true}, function(response){
		if(response.result == 'error'){
			res.writeHead(500);
			logger.info(handler, response);
			return res.end();
		}else{
			if(response.result == 'empty'){
				res.writeHead(404);

			}else{
				res.writeHead(200, {'Content-type': 'application/json'});
			}
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}
var activateConfig = function(req,res){
	var handler = "backend.v1.activateConfig";
	logger.info("starting",handler);
	//find the active configuration for the enablerid
	query('find',{enablerid: req.params.enablerid, active: true}, function(response){
		if(response.result == 'error'){
			res.writeHead(500);
			logger.error(handler, response);
			return res.end();
		}else{
			//check if we have found an active configuration
			if (response.result == 'empty'){
				logger.info(handler, 'there is no previous active configuration');
				logger.info(handler, 'activating configuration number ', req.params.version);
				//activate configuration
				query('find', {enablerid: req.params.enablerid, version: req.params.version}, function(response){
					if (response.result == 'error'){
						res.writeHead(500);
						logger.error(handler, response);
						return res.end();
					}else{
						if (response.result == 'empty'){
							res.writeHead(404);
							logger.error(handler, response);
							return res.end();
						}else{
							response.documents[0].active = true;
							query('save', response.documents[0], function(response){
								if(response.result == 'error'){
									res.writeHead(500);
									logger.error(handler, response);
								}else{
									res.writeHead(200, {'Content-type': 'application/json'});
									var response = {result: 'success'};
									logger.info(handler,response);
								}
								res.write(JSON.stringify(response));
								return res.end();
							})
						}
					}
				})
			}else{
				//we have found a previous active configuration 1)desactivate old 2)active new



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
								if(response.result == 'empty'){
									res.writeHead(404);
									logger.error(handler, response);
									return res.end();
								}else{
									response.documents[0].active = true;
									query('save',response.documents[0], function(response){
										if(response.result == 'error'){
											res.writeHead(500);
											logger.error(handler, response);
										}else{
											res.writeHead(200, {'Content-type': 'application/json'});
											var response = {result: 'success'};
											logger.info(handler,response);
											
										}
										res.write(JSON.stringify(response));
										return res.end();
									})
								}
							}
						})
					}
				})
			}
		}
	})
}
var getLastConfig = function(req,res){
	var handler = "backend.v1.getLastConfig";
	logger.info("starting",handler);
	query('last',{enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			if(response.result == 'empty'){
				res.writeHead(404);
			}else{
				res.writeHead(200, {'Content-type': 'application/json'});
			}
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}
var getFirstConfig = function(req,res){
	var handler = "backend.v1.getFirstConfig";
	logger.info("starting",handler);
	query('first',{enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			if(response.result == 'empty'){
				res.writeHead(404);
			}else{
				res.writeHead(200, {'Content-type': 'application/json'});	
			}
			res.write(JSON.stringify(response));
			logger.info(handler,response);
			return res.end();
		}
	})
}
var getNextVersion = function(req,res){
	var handler = "backend.v1.getNextVersion";
	logger.info("starting",handler);
	
	_getNextVersion(req.params.enablerid, function(result){
		if(result == -1){
			//error
			res.writeHead(500);
			logger.info(handler);
			return res.end();
		}else{
			var response = {result: 'success', documents: {version: result}}
			logger.info(handler,response)
			res.writeHead(200, {'Content-type': 'application/json'});
			res.write(JSON.stringify(response))
			return res.end();
		}
	})
}

var _getNextVersion = function(enablerid, callback){
	var max = 0;
	query('find', {enablerid: enablerid}, function(response){
		if(response.result == 'error'){
			callback(-1);
		}else{
			try {
				response.documents.forEach(function(eachConfig){
					if (eachConfig.version > max){
						max = eachConfig.version
					}
				})
				callback(max+1);
			}catch(e){
				throw e;
				callback(-1);
			}
		}
	})
}

module.exports.configurationsDispatcher = function(req,res,next){
	var handler = "backend.v1.configurationsDispatcher";
	logger.info("starting",handler);
	//Filters checker
	if (hasActive(req)){
		if (req.query.active == 'true'){
			getActiveConfig(req,res);
		}else{
			getAllConfigs(req,res);
		}
	}else{
		if (hasFilter(req)){
			switch(req.query.filter){
				case 'last':
					getLastConfig(req,res);
					break;
				case 'first':
					getFirstConfig(req,res);
					break;
				case 'next':
					getNextVersion(req,res);
					break;
				case 'active':
					getActiveConfig(req,res);
					break;
				default:
					res.writeHead(422);
					res.end();
			}
		}else{
			getAllConfigs(req,res);
		}
	}
	
}

module.exports.addConfig = function(req,res){
	var handler = "backend.v1.adConfig";
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
	//verify if the given version is the right one to use
	_getNextVersion(req.body.enablerid, function(result){
		if(result == -1){
			//error

		}else{
			if(parseInt(req.body.version,10) == parseInt(result,10)){
				query('save',newconfig,function(response){
					if(response.result == 'error'){
						logger.error(handler, result);
						res.writeHead(500);
						return res.end();
						throw result;
					}else{
						logger.info(handler,response)
						res.writeHead(201, {'Content-type': 'application/json'});
						return res.end();
					}
				})
			}else{
				logger.info(handler, "Given version is not the correct to use. Updating...");
				newconfig.version = result;
				query('save',newconfig,function(response){
					if(response.result == 'error'){
						logger.error(handler, result);
						res.writeHead(500);
						return res.end();
						throw result;
					}else{
						logger.info(handler,response)
						res.writeHead(201, {'Content-type': 'application/json'});
						return res.end();
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
		documents: []
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
						//check if there is documents inside
						if (documents.length == 0){
							response.result = 'empty'
							logger.info(handler, response)
							callback(response)
						}else{
							response.result = 'success';
							response.documents = documents;
							logger.info(handler, response);
							callback(response);
						}
					}
				})
				break;
			case 'last':
				configModel.find(queryJSON).sort({created_at: -1}).limit(1).exec(function(err, documents){
					if(err){
						logger.error(handler, err);
						response.result = 'error';
						response.documents = err;
						callback(response);
						throw err;
					}else{
						//check if there is documents inside
						if (documents.length == 0){
							response.result = 'empty'
							logger.info(handler, response)
							callback(response)
						}else{
							response.result = 'success';
							response.documents = documents;
							logger.info(handler, response);
							callback(response);
						}
					}
				})
				break;
			case 'first':
				configModel.find(queryJSON).sort({created_at: 1}).limit(1).exec(function(err, documents){
					if(err){
						logger.error(handler, err);
						response.result = 'error';
						response.documents = err;
						callback(response);
						throw err;
					}else{
						//check if there is documents inside
						if (documents.length == 0){
							response.result = 'empty'
							logger.info(handler, response)
							callback(response)
						}else{
							response.result = 'success';
							response.documents = documents;
							logger.info(handler, response);
							callback(response);
						}
						
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