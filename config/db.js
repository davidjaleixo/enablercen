module.exports = {
	//uncomment this to use it on a docker environment
	url : 'mongodb://mongo/configdb', 
	//uncomment this to use it on a non-docker environment
	//url : 'mongodb://localhost/configdb',
	options: {
		server:{
			reconnectTries : 30,
			reconnectInterval : 3000
		}
	}

}