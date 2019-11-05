'use strict';
console.log("Loading Constants");

angular.module('configApp')
.constant('MODES', {
	NEW: 'Creating new Configuration',
	PARENT: 'Creating a configuration parent'
})