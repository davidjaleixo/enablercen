console.log("Loading SecondVersion");

angular.module('configApp')

.controller('SecondVersion', ['$scope', '$routeParams', 'configService', 'modalService', 'Notification', 'MODES', function($scope, $routeParams, configService, modalService, Notification, MODES) {
    
    $scope.enablerv = "v2.0.2018"

    console.log("DEBUG : Configurator : Loading Main Controller")

    $scope.createconfig = function(){
    	console.log("DEBUG : Creating Configuration")
    	configService.create().then(function(result){
    		console.log("response from configService: " + JSON.stringify(result))
    	});
    }
    
    $scope.getconfigsv2 = function(){
        configService.getconfigs($routeParams.enablerid).then(function(result){
            console.log("Response from configService: " + JSON.stringify(result.data.documents))
        });
    }
    
    //check if there is old configurations for that enabler
    //V2
    configService.getconfigsv2($routeParams.enablerid).then(function(result){
        console.log("result: " + JSON.stringify(result))
        //there is configurations
        //notify the user
        var modalObj = modalService.open('views/foundconfigsmodalv2.html', {configs: result.data.documents});
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
    $scope.addNesting = function(){
        var nestingExist = false;
        //open modal to views list of configurations
        configService.getconfigsv2($routeParams.enablerid).then(function(result){
            var addNestingModal = modalService.addNesting('views/nestingConfigs.html',{configs: result.data.documents});
                addNestingModal.result.then(function(nestedConfigs){
                    //manage array of config versions to be nested
                    console.log("result of addNesting: " + JSON.stringify(nestedConfigs));
                    //verify if nesting key already exist
                    angular.forEach($scope.config.body, function(eachParameter){
                        if(eachParameter.key == "nesting"){
                            eachParameter.value = nestedConfigs.parameters.value;
                            nestingExist = true;
                        }
                    })
                    if(nestingExist == false){
                        $scope.config.body.push({id: $scope.config.body.length+1, key: nestedConfigs.parameters.key, value: nestedConfigs.parameters.value});    
                    }
                    
                    console.log("DEBUG: " + JSON.stringify($scope.config.body));
                })
        });
        
        //possible views

    }
    $scope.addNewParameter = function(){
            var newParameterModal = modalService.addParameter('views/newparameter.html', {});
            //var newParameterModal = modalService.addParameter('views/modal.html', {});
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
                body : [],
                nesting : [],
                path : $scope.config.path,
                configname: $scope.config.configname
            };
            $scope.config.body.forEach(function(eachParameter){
                var myobj = {};
                //check nesting
                if(eachParameter.key == "nesting"){
                    outputconfig.nesting = eachParameter.value;
                    console.log("DEBUG: Found nesting configuration");
                }else{
                    myobj[eachParameter.key] = eachParameter.value;
                    outputconfig.body.push(myobj);
                }
                
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
                body : [],
                nesting : [],
                path : $scope.config.path,
                configname: $scope.config.configname

            };
            $scope.config.body.forEach(function(eachParameter){
                var myobj = {};
                //check nesting
                if(eachParameter.key == "nesting"){
                    outputconfig.nesting = eachParameter.value;
                    console.log("DEBUG: Found nesting configuration");
                }else{
                    myobj[eachParameter.key] = eachParameter.value;
                    outputconfig.body.push(myobj);
                }
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



