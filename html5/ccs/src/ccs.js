if(window && window.moment && typeof window.moment == "function"){
	var ccs = require('./factory');
	module.exports = ccs;
}else{
	throw "CCS relies on the Moment library: http://momentjs.com/";
}