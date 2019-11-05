console.log("DEBUG : Loading Services");

angular.module('configApp')

.factory('convert', function(){
  return{
    toxml: function(o, tab){

         var toXml = function(v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
               for (var i=0, n=v.length; i<n; i++)
                  xml += ind + toXml(v[i], name, ind+"\t") + "\n";
            }
            else if (typeof(v) == "object") {
               var hasChild = false;
               xml += ind + "<" + name;
               for (var m in v) {
                  if (m.charAt(0) == "@")
                     xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                  else
                     hasChild = true;
               }
               xml += hasChild ? ">" : "/>";
               if (hasChild) {
                  for (var m in v) {
                     if (m == "#text")
                        xml += v[m];
                     else if (m == "#cdata")
                        xml += "<![CDATA[" + v[m] + "]]>";
                     else if (m.charAt(0) != "@")
                        xml += toXml(v[m], m, ind+"\t");
                  }
                  xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
               }
            }
            else {
               xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
            }
            return xml;
         }, xml='<?xml version="1.0" encoding="UTF-8"?>';
         for (var m in o)
            xml += toXml(o[m], m, "");
         return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    },
    toprops:function(o){
      var props = "";
      var toProps = function(key, value){
        var returned = "";
        if (value instanceof Array){
          for(var i in value){
            returned += toProps(key, value[i])+"\n";
          }
        }else if (typeof(value) == "object"){
          angular.forEach(value, function(ovalue, okey){
            returned += toProps(okey,ovalue);
          })
        }else if (typeof(value) == "number"){
          console.log("IS NUMBER!!!!");
          returned += key + ": " + value.toString();
        }else{
          returned += key + ": " + value.toString();
        }
        return returned;
      }
      //logic
      angular.forEach(o, function(value, key){
        props += toProps(key, value) + "\n";
      })
      return props;
    }
  }
})

//service to handle configurations
.factory('configService', function($http){
	return {
		createconfig: function(enablerid, data){
			//console.log("Posting data to /api/create... " + JSON.stringify(data))
			return $http.post('/api/vf-os-enabler/v2/enabler/'+ enablerid + '/configurations', data)
		},
		getconfig: function(enablerid, version){
			//console.log("configService : getconfig for enablerid " + enablerid + " with version " + version)
			return $http.get('/api/vf-os-enabler/v1/enabler/'+ enablerid + '/configurations/' + version)
		},
		getconfigs: function(enablerid){
			//console.log("configService : getconfigs for enabler " + enablerid)
			return $http.get('/api/vf-os-enabler/v1/enabler/'+ enablerid + '/configurations')
		},
    getconfigsv2: function(enablerid){
      return $http.get('/api/vf-os-enabler/v2/enabler/'+ enablerid)
    },
		getnewversion: function(enablerid){
			//console.log("configService : getnewversion " + enablerid)
			return $http.get('/api/vf-os-enabler/v1/enabler/'+ enablerid + '/configurations?filter=next')
		},
		activate: function(enablerid, version){
			//console.log("configService : activate " + version)
      var patchData = [
      {o:'replace', k: 'active', v: true}
      ]
			return $http.patch('/api/vf-os-enabler/v1/enabler/'+ enablerid + '/configurations/' + version , patchData)
		},
    getenablers: function(){
      return $http.get('/api/vf-os-enabler/v2/enabler')
    }
	}
})

.factory('modalService', ['$uibModal', function($uibModal) {

  return {
    open: function(templateLink, data) {
        console.log("modalService: open with template: " + templateLink); 
        try {
        var modalObj = $uibModal.open({
            templateUrl: templateLink,
            controller: function($scope, $uibModalInstance, ctrldata, modalService){
            $scope.oldconfigs = ctrldata.configs;


              $scope.ok = function(){
                //Process OK Button Click
                 //identify the latest version
                 var latestVersion = 1;
                 var i = 0;
                 $scope.oldconfigs.forEach(function(eachConfig){
                 	if (eachConfig.version > latestVersion){
                 		latestVersion = eachConfig.version
                 	}
                 	if (i == $scope.oldconfigs.length-1){
                 		//on the last oldconfig, close the modal returning the current new version id
                 		$uibModalInstance.close({result: 'makenew', parameters: {version: latestVersion + 1}});
                 	}
                 	i++;
                 })
                 //$uibModalInstance.close({result: 'makenew', parameters: {version: 10}}); 
              },
              //$scope.cancel = function(){
              //  $uibModalInstance.dismiss('cancel');
              //},
              $scope.makeparent = function(version){
              	//alert("This is the version selected: " + version)
              	//$scope.makeparentresult = version
              	var latestVersion = 1;
              	var i = 0;

              	$scope.oldconfigs.forEach(function(eachConfig){
                 	if (eachConfig.version > latestVersion){
                 		latestVersion = eachConfig.version
                 	}
                 	if (i == $scope.oldconfigs.length-1){
                 		//on the last oldconfig, close the modal returning the current new version id with the parent version
                 		$uibModalInstance.close({result: 'makeparent', parameters: {parentversion: version, newversion: latestVersion+1}})
                 	}
                 	i++;
                 })
              	
              },
              $scope.viewconfig = function(config){
              	modalService.viewconfig(config);
              }
          	},
            size: 'lg',
            keyboard: true,
            resolve: {
              ctrldata: data
          },
          windowClass: 'show', backdropClass: 'show' //bootstrap v4.0 issue with uibmodal
        });

        return modalObj;
        
	    } catch(err){
	        console.log("error: " + err.stack);


	    }
  	},
    addNesting: function(templateLink, data){
      console.log("modalService: addNesting");
      try {
        var modalObj = $uibModal.open({
          templateUrl: templateLink,
          controller: function($scope, $uibModalInstance, ctrldata, modalService){
            $scope.configs = ctrldata.configs;
            $scope.configs.forEach(function(eachConfig){
              eachConfig.nested = false;
            })
            $scope.newparameterkey = "";
            $scope.nested = [];
            $scope.addNest = function(configVersion){
              
              $scope.configs.forEach(function(eachConfig){
                if(eachConfig.version == configVersion && eachConfig.nested == false){
                  eachConfig.nested = true;
                  $scope.nested.push(configVersion);
                }
              })
              console.log("DEBUG: adding nested config: " + configVersion);
              console.log("DEBUG: nested configs already in place: " + JSON.stringify($scope.nested));
            }
            $scope.delNest = function(configVersion){
              console.log("DEBUG: deleting from nested: " + configVersion);
              $scope.configs.forEach(function(eachConfig){
                if(eachConfig.version == configVersion && eachConfig.nested == true){
                  eachConfig.nested = false;
                  $scope.nested.splice($scope.nested.indexOf(configVersion),1);
                }
              })
              console.log("DEBUG: nested configs already in place: " + JSON.stringify($scope.nested));
            }
            $scope.save = function(){
              $uibModalInstance.close({result: 'addNesting', parameters: {key: "nesting", value: $scope.nested}});
            }
            $scope.viewconfig = function(config){
              modalService.viewconfig(config);
            }
          },
          size: 'lg',
              keyboard: true,
              resolve: {
                ctrldata: data
              },
          windowClass: 'show', 
          backdropClass: 'show'
        });
        return modalObj;
      }catch(err){
        console.log("error: " + err.stack);
      }
    },
    addconfig: function(templateLink, data){
      console.log("modalService: addconfig");
      try {
        var modalObj = $uibModal.open({
          templateUrl: templateLink,
          controller: function($scope, $uibModalInstance, ctrldata){
            $scope.ctrldata = ctrldata;
            $scope.enablerid = "";
            $scope.save = function(){
              $uibModalInstance.close({result: 'addconfig', parameters: {id: $scope.enablerid}});
            }
          },
          size: 'lg',
          keyboard: true,
          resolve: {
            ctrldata: data
          },
          windowClass: 'show', 
          backdropClass: 'show'
        });
        return modalObj;
      }catch(err){
        console.log("error: " + err.stack);
      }
    },
  	addParameter: function(templateLink, data){
  		console.log("modalService: addParameter");
  		try {
  			var modalObj = $uibModal.open({
  				templateUrl: templateLink,
  				controller: function($scope, $uibModalInstance, ctrldata){
  					$scope.ctrldata = ctrldata;
  					$scope.newparameterkey = "";
  					$scope.save = function(){
  						$uibModalInstance.close({result: 'addParameter', parameters: {key: $scope.newparameterkey}});
  					}
  				},
  				size: 'lg',
          keyboard: true,
          resolve: {
            ctrldata: data
        	},
          windowClass: 'show', 
          backdropClass: 'show'
  			});
  			return modalObj;
  		}catch(err){
  			console.log("error: " + err.stack);
  		}
  	},
  	editParameter: function(templateLink, data){
  		console.log("modalService: editParameter data: " + JSON.stringify(data.parameterkey));
  		try {
  			var modalObj = $uibModal.open({
  				templateUrl: templateLink,
  				controller: function($scope, $uibModalInstance, ctrldata){
  					console.log("trace the ctrldata" + JSON.stringify(ctrldata));
            $scope.parameterkey = ctrldata.parameterkey;
  					$scope.save = function(){
  						$uibModalInstance.close({result: 'editParameter', parameters: {key: $scope.parameterkey}});
  					}
  				},
  				size: 'lg',
          keyboard: true,
          resolve: {
            ctrldata: data
        	},
          windowClass: 'show', 
          backdropClass: 'show'
  			});
  			return modalObj;
  		}catch(err){
  			console.log("error: " + err.stack);
  		}
  	},
  	confirm: function(title, content, yesmsg, nomsg){
  		console.log("modalService: confirm");
  		try{
  			var modalObj = $uibModal.open({
  				templateUrl: 'views/confirm.html',
  				controller: function($scope, $uibModalInstance, ctrldata){
  					$scope.title = ctrldata.title;
  					$scope.content = ctrldata.content;
  					$scope.yesmsg = ctrldata.yesmsg;
  					$scope.nomsg = ctrldata.nomsg;
  					$scope.yes = function(){
  						$uibModalInstance.close({result: 'yes'});
  					}
  					$scope.no = function(){
  						$uibModalInstance.close({result: 'no'});
  					}
  				},
  				size: 'sm',
  				keyboard: false,
  				resolve: {
  					ctrldata: {title: title, content: content, yesmsg: yesmsg, nomsg: nomsg}
  				},
          windowClass: 'show', 
          backdropClass: 'show'
  			});
  			return modalObj;
  		}catch(err){
  			console.log("error: "+err.stack);
  		}
  	},
  	viewconfig: function(data){
  		console.log("modalService: view data: " + JSON.stringify(data));
  		try{
  			var modalObj = $uibModal.open({
  				templateUrl: 'views/view.html',
  				controller: function($scope, $uibModalInstance, ctrldata){
  					$scope.config = ctrldata;
  					$scope.close = function(){
  						$uibModalInstance.close({result: 'close'});
  					}
  				},
  				size: 'lg',
  				keyboard: false,
  				resolve: {
  					ctrldata: data
  				},
          windowClass: 'show', 
          backdropClass: 'show'
  			});
  			return modalObj
  		}catch(err){
  			console.log("error: " + err.stack);
  		}
  	}
    }
}])

