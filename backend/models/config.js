// backend/models/model.js

var mongoose = require('mongoose');

// define our Configmodel
// module.exports allows us to pass this to other files when it is called
//Schema!
module.exports = mongoose.model('Config', {
	version : {type : Number, default: 1},
	enablerid : {type: String, default: ''},
	active : {type: Boolean, default: false },
	parent : {type: Number, default: 0},
	comment : {type: String, default: ''},
	body : {type: Object, default: ''},
	created_at : {type: Date, default: '', required: true},
	configname : {type: String, default: 'defaultconfigname'},
	path : {type: String, default:'defaultpath'},
	nesting: {type: Object, default: ''}
});