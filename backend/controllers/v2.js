//controller V2
// @KBiz david.aleixo@knowledgebiz.pt

var configModel = require('../models/config.js');
var logger		= require('../../config/logger.js');
var mongoose	= require('mongoose');

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
module.exports.getenablers = function(req,res){
	var handler = "backend.v2.getenablers";
	logger.info("starting",handler);
	var response = {
		result: "success",
		documents: []
	}
	var exists = false;
	/*example
	{
	"id":"1",
	"versions":"35"
	}
	*/
	configModel.find({},function(err, documents){
		if(err){
			logger.error(handler, err);
			//response.result = 'error';
			//response.documents = err;
			res.writeHead(500);
			return res.end();
			throw err;
		}else{
			
			//handle response
			documents.forEach(function(eachDoc){
				//check if the enabler already exists in the response array
				response.documents.forEach(function(eachRes){
					if(eachRes.id == eachDoc.enablerid){
						exists = true;
					}else{
						exists = false
					}
				})
				if(exists){
					
					//increment versions
					response.documents.forEach(function(eachRes){
						if(eachRes.id == eachDoc.enablerid){
							eachRes.versions = eachRes.versions + 1;
						}
					})
					exists = false;
				}else{
					var store = {
						id: eachDoc.enablerid, 
						versions: 1
					}
					response.documents.push(store);
				}
			})

			//response.result = 'success';
			//response.documents = documents;
			logger.info(handler, response);
			res.writeHead(200, {'Content-type':'application/json'});
			res.write(JSON.stringify(response));
			return res.end();
		}
	})
}
module.exports.addConfig = function(req,res){
	var handler = "backend.v2.addConfig";
	logger.info("starting",handler);
	//grab the config model
	var newconfig = new configModel({
		version : parseInt(req.body.version, 10),
		enablerid : req.body.enablerid,
		active : req.body.active,
		parent : req.body.parent,
		comment : req.body.comment,
		body : req.body.body,
		created_at : new Date(),
		path: req.body.path,
		configname: req.body.configname,
		nesting: req.body.nesting
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

function resolveNest(input, callback){
	input = input.documents[0];
	logger.info("starting resolve nested configurations for configuration ", input.version);
	var it = 0;
	
	//check if nesting is valid
	if (input.nesting){
		input.nesting.forEach(function(eachNest){
			//get nested body
			query('find', {enablerid: input.enablerid, version: eachNest}, function(response){
				response.documents[0].body.forEach(function(eachElem){
					
					input.body.push(eachElem);
				})
				it++;
				if(it == input.nesting.length){
					callback(input);
				}
			})
		})
	}else{
		callback("Error while processing nesting configurations");
	}
	
}
module.exports.presentConfigs = function(req,res){
	var handler = "backend.v2.presentConfigs";
	logger.info("starting",handler);
	query('find',{enablerid: req.params.enablerid}, function(response){
		if(response.result == 'error'){
			logger.error(handler, response);
			res.writeHead(500);
			return res.end();
		}else{
			res.writeHead(200, {'Content-type':'application/json'});
			res.write(JSON.stringify(response));
			return res.end();
		}
	})
}
module.exports.getConfig = function(req,res){
	var handler = "backend.v2.getConfig";
	logger.info("starting",handler);

	//verify req.body
	if (req.params.enablerid && req.params.configname){

		if(req.params.version){
			//specific version
			query('find',{enablerid: req.params.enablerid, configname: req.params.configname, version: req.params.version}, function(response){
				if(response.result == 'error'){
					logger.error(handler, response);
					res.writeHead(500);
					return res.end();
				}else{
					logger.info(handler, response);
					if(req.query.resolvenesting){
						resolveNest(response, function(responseNested){
							res.writeHead(200, {'Content-type':'application/json'});
							res.write(JSON.stringify({result: 'success', documents: [responseNested]}));
							return res.end();
						})
					}else{
						res.writeHead(200, {'Content-type':'application/json'});
						res.write(JSON.stringify(response));
						return res.end();
					}
					
				}
			})
		}else{
			//last versions
			query('last',{enablerid: req.params.enablerid, configname: req.params.configname}, function(response){
				if(response.result == 'error'){
					logger.error(handler, response);
					res.writeHead(500);
					return res.end();
				}else{
					logger.info(handler, response);
					if(req.query.resolvenesting){
						resolveNest(response, function(responseNested){
							res.writeHead(200, {'Content-type':'application/json'});
							res.write(JSON.stringify({result: 'success', documents: [responseNested]}));
							return res.end();
						})
					}else{
						res.writeHead(200, {'Content-type':'application/json'});
						res.write(JSON.stringify(response));
						return res.end();
					}
					
				}
			})
		}
	}else{
		res.writeHead(404);
		return res.end();
	}
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