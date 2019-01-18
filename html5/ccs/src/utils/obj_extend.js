//this will overwrite o with properties from o2
module.exports = (function() {
    function isObject(m) {
        return (typeof m == 'object' && !(m instanceof Array));
    }

    function extend(o, o2) {
        if ( isObject(o) && isObject(o2) ) {
            var keys = Object.keys(o2),
                key;
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if ( o[key] && isObject(o2[key]) && isObject(o[key]) ) {
                    extend(o[key], o2[key]);
                //can be modified hereafter to perform extended checks or operations
                }else{
                	o[key] = o2[key]
                }
            }
        } else {
           	return false; //fail softly
        }
    }
    return extend;
})();