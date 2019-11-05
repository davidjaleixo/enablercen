console.log("Loading MainController");

angular.module('configApp')

.controller('MainController', ['$scope', '$routeParams', 'configService', 'modalService', 'Notification', 'MODES', function($scope, $routeParams, configService, modalService, Notification, MODES) {
    
    console.log("DEBUG : Configurator : Loading Main Controller")

    $scope.createconfig = function(){
    	console.log("DEBUG : Creating Configuration")
    	configService.create().then(function(result){
    		console.log("response from configService: " + JSON.stringify(result))
    	});
    }

    $scope.getconfigs = function(){
    	console.log("DEBUG : Getting configurations");
    	configService.getconfigs($routeParams.enablerid).then(function(result){
    		console.log("Response from configService: " + JSON.stringify(result.data.documents))
    	});
    }
    
    
    //check if there is old configurations for that enabler
    configService.getconfigs($routeParams.enablerid).then(function(result){
        console.log("result: " + JSON.stringify(result))
		//there is configurations
		//notify the user
		var modalObj = modalService.open('views/foundconfigsmodal.html', {configs: result.data.documents});
        //check the modal result
        modalObj.result.then(function(closeresult){
            //console.log("result of then: " + JSON.stringify(closeresult))
            if (closeresult.result == 'makeparent'){
                //the user has selected to make a configuration parent
                console.log("the user has selected to make a configuration parent from version " + closeresult.parameters.parentversion);
                Notification.info('You are going to create a configuration based on ' + closeresult.parameters.parentversion + "the new version is:" + closeresult.parameters.newversion);
                createParent(closeresult.parameters.newversion, closeresult.parameters.parentversion);
            }
            if (closeresult.result == 'makenew'){
                //the user has selected to make a new configuration
                createNewConfig(closeresult.parameters.version);
            }
            
            //$scope.selectedconfig = selectedconfig;
            
        },function(){
            //create new configuration without any configuration parent
            console.log("Modal dismissed...");
            configService.getnewversion($routeParams.enablerid).then(function(response){
                if (response.data.result == 'success'){
                    Notification.info('You are going to create a new configuration');
                    createNewConfig(response.data.documents.version);
                }else{

                }
            })
            
        })
    	
    },function(result){
        //404
        //there is no previous configurations found
        createNewConfig(1);
    })
    var createParent = function(newVersion, parentVersion){
        configService.getconfig($routeParams.enablerid, parentVersion).then(function(response){
            console.log("RESPONSE: " + JSON.stringify(response));
            if (response.data.result == 'success'){
                Notification.info('Please proceed with the changes on the new parent configuration');
                $scope.config = {
                    mode: "Creating a configuration parent",
                    version: newVersion,
                    parent: parentVersion,
                    enablerid: $routeParams.enablerid,
                    comment: "",
                    body: []
                }
            }
            //populate body
            angular.forEach(response.data.documents[0].body, function(cpvalue,cpindex){
                $scope.config.body.push({id: cpindex+1, key: Object.keys(cpvalue)[0], value: Object.values(cpvalue)[0]});
            })
            //$scope.config.body = angular.copy(response.data.parameters.config[0].body);
            console.log("scope.config:"+JSON.stringify($scope.config));
        })
    }

    var createNewConfig = function(newVersion){
        console.log("the user has selected to make a new configuration ");
        $scope.config = {
            mode: 'Creating new Configuration', 
            version: newVersion, 
            enablerid: $routeParams.enablerid,
            comment: "",
            body: []
        };
        
    }
    $scope.addNewParameter = function(){
            var newParameterModal = modalService.addParameter('views/newparameter.html', {});
            newParameterModal.result.then(function(newParameterKey){
                $scope.config.body.push({id: $scope.config.body.length +1, key: newParameterKey.parameters.key, value: ""})
            })

        }
        $scope.editParameter = function(parameterid, parameterkey){
            var editParameterModal = modalService.editParameter('views/editkeyparameter.html', {parameterkey: parameterkey});
            editParameterModal.result.then(function(editedKey){
                $scope.config.body.forEach(function(eachParameter){
                    if((parameterid == eachParameter.id)){
                        eachParameter.key = editedKey.parameters.key;
                    }
                })
            })
        }
        $scope.delParameter = function(index){
            $scope.config.body.splice(index,1);
        }
    //Submit
    $scope.createConfig = function(mode){
        console.log("Creating config in mode: " + mode + " * " + JSON.stringify($scope.config));
        if(mode == "Creating a configuration parent"){
            //creating parent configuration
            //creating new configuration
            var outputconfig = {
                version : $scope.config.version,
                enablerid : $scope.config.enablerid,
                active : false,
                parent : $scope.config.parent,
                comment : $scope.config.comment,
                body : []
            };
            $scope.config.body.forEach(function(eachParameter){
                var myobj = {};
                myobj[eachParameter.key] = eachParameter.value;
                outputconfig.body.push(myobj);
            })
            configService.createconfig($routeParams.enablerid, outputconfig).then(function(result){
                console.log("response from configService: " + JSON.stringify(result))
                Notification.success('Your Configuration has been created');
                //disable form
                $scope.config = {};
            })
        }
        if(mode == "Creating new Configuration"){
            //creating new configuration
            var outputconfig = {
                version : $scope.config.version,
                enablerid : $scope.config.enablerid,
                active : false,
                parent : null,
                comment : $scope.config.comment,
                body : []
            };
            $scope.config.body.forEach(function(eachParameter){
                var myobj = {};
                myobj[eachParameter.key] = eachParameter.value;
                outputconfig.body.push(myobj);
            })
            configService.createconfig($routeParams.enablerid, outputconfig).then(function(result){
                console.log("response from configService: " + JSON.stringify(result))
                Notification.success('Your Configuration has been created');
                //disable form
                $scope.config = {};
            })
        }
        

    }
}])
.controller('ManageController', ['$scope','$routeParams','configService','modalService', 'Notification', 'convert', function($scope, $routeParams, configService, modalService, Notification, convert){
    
    $scope.enablerid = $routeParams.enablerid;
    configService.getconfigs($routeParams.enablerid).then(function(response){
        if(response.data.result == 'success'){
            $scope.configs = response.data.documents;
        }
    }, function(response){
        //404
        //TODO
    })
    $scope.activate = function(activateVersion){
        modalService.confirm('Confirmation', 'Are you sure you want to activate version ' + activateVersion, 'Activate', 'Think better').result.then(function(closeresult){
            if(closeresult.result == 'yes'){
                configService.activate($routeParams.enablerid, activateVersion).then(function(response){
                    if(response.data.result == 'success'){
                        Notification.success('Configuration '+activateVersion + ' was activated');
                        configService.getconfigs($routeParams.enablerid).then(function(response){
                            if(response.data.result == 'success'){
                                $scope.configs = response.data.documents;
                            }
                        })
                    }
                })
            }
        })
    }
    $scope.view = function(viewVersion){
        configService.getconfig($routeParams.enablerid, viewVersion).then(function(response){
            if(response.data.result == 'success'){
                modalService.viewconfig(response.data.documents[0]);
            }
        })
    }
    $scope.exportJSON = function(configversion){
        console.log("exporting json...");
        //check browser
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        var isEdge = !isIE && !!window.StyleMedia;
        console.log("what is the browser: " + isChrome + isIE + isEdge);

        configService.getconfig($routeParams.enablerid, configversion).then(function(response){
            if(response.data.result == 'success'){
                console.log("creating blob");
                console.log("resposta:"+JSON.stringify(response.data.documents[0]));
                
                if(isChrome){
                    //var url = window.URL || window.webkitURL;
                    var url = URL.createObjectURL(new Blob([JSON.stringify(response.data.documents[0])]));
                      var a = document.createElement('a');
                      a.href = url;
                      a.download = $routeParams.enablerid+'_'+configversion+'.json';
                      a.target = '_blank';
                      a.click();

                }

                /*var blob = new Blob([response.data.documents[0]], { type:"application/json;charset=utf-8;" });           
                var downloadLink = angular.element('<button></button>');
                downloadLink.attr('href',window.URL.createObjectURL(blob));
                downloadLink.attr('download', $routeParams.enablerid+'_'+configversion+'.json');
                downloadLink[0].click();*/
                console.log("blob"+JSON.stringify(blob));
                console.log("downloadlink"+JSON.stringify(downloadLink));
            }
        })
        
    }
    $scope.exportXML = function(configversion){
        console.log("exporting xml...");
        configService.getconfig($routeParams.enablerid, configversion).then(function(response){
            if(response.data.result == 'success'){
                console.log("creating blob");
                var thisxml = convert.toxml(response.data.documents[0]);
                var url = URL.createObjectURL(new Blob([thisxml]));
                  var a = document.createElement('a');
                  a.href = url;
                  a.download = $routeParams.enablerid+'_'+configversion+'.xml';
                  a.target = '_blank';
                  a.click();
            }
        })
    }
    $scope.exportPROPS = function(configversion){
        console.log("exporting xml...");
        configService.getconfig($routeParams.enablerid, configversion).then(function(response){
            if(response.data.result == 'success'){
                console.log("creating blob");
                var thisprops = convert.toprops(response.data.documents[0]);
                var url = URL.createObjectURL(new Blob([thisprops]));
                  var a = document.createElement('a');
                  a.href = url;
                  a.download = $routeParams.enablerid+'_'+configversion+'.properties';
                  a.target = '_blank';
                  a.click();
            }
        })
    }
}])



