var ccs = require('./lib/constructor')
var utils = require('./utils/utils');

module.exports = (function() {
    /*ccs factory singleton */
    var ccs_factory = function() {
        //global settings
        this.configs = {};
    }

    ccs_factory.prototype = {
        calendars: [],
        create: create,
        config: config
    }

    function config() {

    }

    function create(options) {
        var cal = new ccs(options);
        cal.factory = this;
        this.calendars.push(cal);
        return cal;
    }
    
    return new ccs_factory();
})();