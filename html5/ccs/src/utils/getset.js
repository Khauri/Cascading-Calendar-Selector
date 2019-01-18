/* attaches a getter_setter to an object*/
module.exports = function(name, type) {
    if (!this.__props) this.__props = {};
    if(!this.__props[name]){
    	this.__props[name] = {
    		type: type,
    		value: val,
    	}
    }

    this[name] = function(val) {
        if (typeof val != "undefined") {
        	var type = typeof this.__props[name].type;
        	if( type != 'undefined'){

        	}
            this.__props[name].value = {
                type: type || undefined, //Number, String, Array, Object, Function, Date
                value: val
            }
        } else {
            return this.__props[name].value;
        }
    }
}