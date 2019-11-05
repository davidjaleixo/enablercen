angular.module('configApp')

.controller('HomeController', ['$scope', '$routeParams', 'configService', 'modalService', 'Notification', 'MODES', '$window', function($scope, $routeParams, configService, modalService, Notification, MODES, $window) {	
	configService.getenablers().then(function(response){
		$scope.enablers = response.data.documents;
	})
	$scope.manage = function(id){
		$window.location.href = "/configurationenabler/manage/"+id;
	}
	$scope.config = function(id){
		$window.location.href = "/configurationenabler/config/v2/"+id;
	}
	$scope.new = function(){
		var newconfigModal = modalService.addconfig('views/new.html', {});
            //var newParameterModal = modalService.addParameter('views/modal.html', {});
            newconfigModal.result.then(function(result){
            	//redirect
            	$window.location.href = "/configurationenabler/config/v2/"+result.parameters.id;
            })
	}
}])