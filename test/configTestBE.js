var request 	= require("request");
var assert 		= require("chai").assert;
var expect		= require("chai").expect;
var base_url 	= "http://localhost:3000";
var constants	= require("../constants.js");
var db 			= require("../config/db.js");
var mongoose	= require('mongoose');
var dbModel		= require("../backend/models/config.js");
const sampleDataIt	= 3;


before(function(){
	try{
		mongoose.connect(db.url,db.options);
		var isActive = false;
		for (i = 1; i < sampleDataIt+1; i++){
			if(i == sampleDataIt){
				isActive = true;
			}else{ isActive = false}
			var sampleData = new dbModel({
				version : i,
				enablerid : "testing",
				active : isActive,
				parent : null,
				comment : "This is sample data number " + i,
				body : {},
				created_at : new Date(),
				configname : "myName",
				path: "this/is/my/path"
			});
			sampleData.save(function(error){
				if(error){
					console.log("Sample data was not commited on the DB");
				}
			})
		}
		
	}catch(error){
		console.log("Error: " + error);
		return error;
	}

})

after(function(done){
	console.log("Clean Sample Data DB");
	dbModel.remove({enablerid: "testing"},function(error){
		if(error){
			console.log("Error: " + error)
		}else{
			console.log("Clean Sampla Data DB OK")
		}
	})
	dbModel.remove({enablerid: "thisIsAnotherEnablerId"},function(error){
		if(error){
			console.log("Error: " + error)
		}else{
			console.log("Clean Sample Data DB OK")
		}
	})
	console.log("Disconnecting DB");
	mongoose.disconnect();
	return done();
})

describe("Configurator Enabler BACKEND", function(){
	
	describe("API V2", function(){
		describe("1. GET " + constants.ROUTES.v2 + "/<enablerid>/<configname>/<version>", function(){
			describe("1.1 Query a configuration name version for a existing enabler id", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v2 + "/testing/myName/1", function(error, response, body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v2 + "/testing/myName/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v2 + "/testing/myName/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
				it("should return body with documents' version equal to 1" , function(done){
					request.get(base_url + constants.ROUTES.v2 + "/testing/myName/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 1);
						done();
					})
				})
			})
		})
	})

	describe("API V1", function(){
		describe("1. GET " + constants.ROUTES.v1 + "/<enablerid>/configurations", function(){
			describe("1.1 Query all configurations versions for non-existing enablerid", function(){
				it("should return status code 404", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
				it("should return response body with result empty", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						expect(JSON.parse(body)).to.have.property('result', 'empty');
						assert.equal((JSON.parse(body)).result, 'empty');
						done();
					})
				})
				it("should return response body with documents of type array", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.typeOf((JSON.parse(body)).documents, 'array');
						done();
					})
				})
				it("should return response body with documents of length 0", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						//expect(body).to.have.documents.lengthOf(1);
						assert.equal((JSON.parse(body)).documents.length, 0);
						done();
					})
				})
			})
			describe("1.2 Query all configurations versions for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						expect(JSON.parse(body)).to.have.property('result', 'success');
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of type array", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.typeOf((JSON.parse(body)).documents, 'array');
						done();
					})
				})
				it("should return response body with documents of length " + sampleDataIt, function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, sampleDataIt);
						done();
					})
				})
			})
			describe("1.3 Query active configuration version for non-existing enablerid", function(){
				it("should return status code 404", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
				it("should return response body with result empty", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'empty');
						done();
					})
				})
				it("should return response body with documents of length 0" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testenablerid/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 0);
						done();
					})
				})
			})
			describe("1.4 Query active configuration version for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?active=true", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
			})
			describe("1.5 Query last configuration version for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
				it("should return response body with documents' version 3" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 3);
						done();
					})
				})
			})
			describe("1.6 Query first configuration version for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=first", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=first", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=first", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
				it("should return response body with documents' version 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=first", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 1);
						done();
					})
				})
			})
			describe("1.7 Query next configuration version to be used for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=next", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=next", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents with property version number 4" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=next", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.version, 4);
						done();
					})
				})
			})
		})
		describe("2. GET " + constants.ROUTES.v1 + "/<enablerid>/configurations/<version>", function(){
			describe("2.1 Query configuration version 1 for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
				it("should return body with documents' version equal to 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/1", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 1);
						done();
					})
				})
			})
			describe("2.2 Query configuration version 3 for existing enablerid", function(){
				it("should return status code 200", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/3", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						done();
					})
				})
				it("should return response body with result success", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/3", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("should return response body with documents of length 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/3", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
			})
			describe("2.3 Query no existing configuration version for existing enablerid", function(){
				it("should return status code 404", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/30", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
				it("should return response body with result empty", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/30", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).result, 'empty');
						done();
					})
				})
				it("should return response body with documents of length 0" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/30", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 0);
						done();
					})
				})
			})
		})
		describe("3. PATCH " + constants.ROUTES.v1 + "/<enablerid>/configurations/<versions>", function(){
			describe("3.1 Activate configuration version 1 for existing enablerid", function(){
				it("should return status code 200 and result success", function(done){
					var options = {
						url: base_url + constants.ROUTES.v1 + "/testing/configurations/1",
						method: "PATCH",
						headers: {
							'Accept':'*/*',
							'Content-type': 'application/json'
						},
						body: JSON.stringify([{o: 'replace', k:'active', v:true}])
					}
					request(options, function(error,response,body){
					//request.patch(base_url + constants.ROUTES.v1 + "/testing/configurations/1", patchData, function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 200);
						//assert.equal((JSON.parse(body)).result, 'success');
						done();
					})
				})
				it("old active configuration should be desactivated" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations/3", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].active, false);
						done();
					})
				})
				it("Active configurations list must have length equal to 1" , function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=active", function(error,response,body){
						if(error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents.length, 1);
						done();
					})
				})
			})
			describe("3.2 Activate configuration version 1 for a non existing enablerid", function(){
				it("should return status code 404", function(done){
					var options = {
						url: base_url + constants.ROUTES.v1 + "/testenablerid/configurations/1",
						method: "PATCH",
						headers: {
							'Accept':'*/*',
							'Content-type': 'application/json'
						},
						body: JSON.stringify([{o: 'replace', k:'active', v:true}])
					}
					request(options, function(error, response, body){
						if (error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
			})
			describe("3.3 Activate non-existing configuration version for a existing enablerid", function(){
				it("should return status code 404", function(done){
					var options = {
						url: base_url + constants.ROUTES.v1 + "/testing/configurations/1000",
						method: "PATCH",
						headers: {
							'Accept':'*/*',
							'Content-type': 'application/json'
						},
						body: JSON.stringify([{o: 'replace', k:'active', v:true}])
					}
					request(options, function(error, response, body){
						if (error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
			})
			describe("3.4 Active non-existing configuration version for a non-existing enablerid", function(){
				it("should return status code 404", function(done){
					var options = {
						url: base_url + constants.ROUTES.v1 + "/somethinghere/configurations/1000",
						method: "PATCH",
						headers: {
							'Accept':'*/*',
							'Content-type': 'application/json'
						},
						body: JSON.stringify([{o: 'replace', k:'active', v:true}])
					}
					request(options, function(error, response, body){
						if (error){
							done(error);
							return;
						}
						assert.equal(response.statusCode, 404);
						done();
					})
				})
			})
		})
		describe("4. POST " + constants.ROUTES.v1 + "/<enablerid>/configurations/<version>", function(){
			describe("4.1 Create new configuration version for an existing enablerid", function(){
				it("should return status code 201", function(done){
					var post_data = {
						url: base_url + constants.ROUTES.v1 + "/testing/configurations",
						form:{
							version : 4,
			                enablerid : "testing",
			                active : false,
			                parent : null,
			                comment : "sample created config for testing",
			                body : []
						}
		            }
		            request.post(post_data, function(error, response, body){
		            	if(error){
		            		done(error);
		            		return;
		            	}
		            	assert.equal(response.statusCode, 201);
		            	done();
		            })
            	
				})
				it("DB should have the new configuration version stored marked as last", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if (error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 4);
						done();
					})
				})
			})
			describe("4.2 Create new configuration version for an existing enablerid with incorrect version", function(){
				it("should return status code 201", function(done){
					var post_data = {
						url: base_url + constants.ROUTES.v1 + "/testing/configurations",
						form:{
							version : 40,
			                enablerid : "testing",
			                active : false,
			                parent : null,
			                comment : "sample created config for testing",
			                body : []
						}
		            }
		            request.post(post_data, function(error, response, body){
		            	if(error){
		            		done(error);
		            		return;
		            	}
		            	assert.equal(response.statusCode, 201);
		            	done();
		            })
				})
				it("stored configuration version should be the correct number 5", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if (error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 5);
						done();
					})
				})
			})
			describe("4.3 Create new configuration version for an existing enablerid with no version key in payload", function(){
				it("should return status code 201", function(done){
					var post_data = {
						url: base_url + constants.ROUTES.v1 + "/testing/configurations",
						form:{
			                enablerid : "testing",
			                active : false,
			                parent : null,
			                comment : "sample created config for testing",
			                body : []
						}
		            }
		            request.post(post_data, function(error, response, body){
		            	if(error){
		            		done(error);
		            		return;
		            	}
		            	assert.equal(response.statusCode, 201);
		            	done();
		            })
				})
				it("stored configuration version should be the correct number 6", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/testing/configurations?filter=last", function(error,response,body){
						if (error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 6);
						done();
					})
				})
			})
			describe("4.4 Create new configuration version for an non-existing enablerid with incorrect version", function(){
				it("should return status code 201", function(done){
					var post_data = {
						url: base_url + constants.ROUTES.v1 + "/thisIsAnotherEnablerId/configurations",
						form:{
							version : 100,
			                enablerid : "thisIsAnotherEnablerId",
			                active : false,
			                parent : null,
			                comment : "sample config for testing",
			                body : []
						}
		            }
		            request.post(post_data, function(error, response, body){
		            	if(error){
		            		done(error);
		            		return;
		            	}
		            	assert.equal(response.statusCode, 201);
		            	done();
		            })
				})
				it("stored configuration version should be the correct number 1", function(done){
					request.get(base_url + constants.ROUTES.v1 + "/thisIsAnotherEnablerId/configurations?filter=last", function(error,response,body){
						if (error){
							done(error);
							return;
						}
						assert.equal((JSON.parse(body)).documents[0].version, 1);
						done();
					})
				})
			})
		})
	})
})

