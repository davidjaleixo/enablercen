var winston = require('winston');

module.exports = mylogger = new (winston.Logger)({
	level: 'debug',
	transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'configurator.log' })
    ]
});

