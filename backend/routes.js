var constants = require('../constants.js');
var controller = require('./controllers/controller');
var v1 = require('./controllers/v1');
var v2 = require('./controllers/v2');


module.exports = function(app) {

    // server routes ===========================================================

    //v2 routes
    app.get('/api/vf-os-enabler/v2/enabler/:enablerid', controller.log, v2.presentConfigs);
    app.get('/api/vf-os-enabler/v2/enabler/:enablerid/:configname', controller.log, v2.getConfig);
    app.get('/api/vf-os-enabler/v2/enabler/:enablerid/:configname/:version', controller.log, v2.getConfig);
    app.post('/api/vf-os-enabler/v2/enabler/:enablerid/configurations', controller.log, v2.addConfig);
    app.get('/api/vf-os-enabler/v2/enabler', controller.log, v2.getenablers);

    //v1 routes
    app.get('/api/vf-os-enabler/v1/enabler/:enablerid/configurations', controller.log, v1.configurationsDispatcher);
    app.get('/api/vf-os-enabler/v1/enabler/:enablerid/configurations/:version', controller.log, v1.getVersion);
    app.post('/api/vf-os-enabler/v1/enabler/:enablerid/configurations', controller.log, v1.addConfig);
    app.patch('/api/vf-os-enabler/v1/enabler/:enablerid/configurations/:version', controller.log, v1.patchCollection);

    //v0 routes
    app.post('/api/createconfig',  controller.log, controller.create);
    app.get('/api/getconfig/:enablerid/:version', controller.log, controller.getconfig);
    app.get('/api/getconfigs/:enablerid', controller.log, controller.getconfigs);
    app.get('/api/getnewversion/:enablerid', controller.log, controller.getnewversion);

    app.get('/api/getactiveconfig/:enablerid', controller.log, controller.getactiveconfig);
    app.get('/api/activate/:enablerid/:version', controller.log, controller.activate);

    // frontend routes =========================================================
    // route to handle all angular requests

    app.get('*', function(req, res) {
        res.sendFile('index.html', { root: constants.FRONTEND_PATH + '/public/views/' }); // load our public/index.html file
    });

};