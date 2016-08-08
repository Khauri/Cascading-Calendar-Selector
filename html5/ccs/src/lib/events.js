(function() {
    var Moment = require('moment');
    var events = {
        onSelect: [],
        onDeselect: [],
        complete: [],
        clear: [],
    }

    function clickHandler() {

    }

    function on() {

    }

    function off() {

    }

    function addEvents(ccs, y, m, d) {
        y.addEventListener('click', function(e) {
            //console.log(e);
            if (!e.srcElement.classList.contains("ccs_col")) return false;
            //e.srcElement.classList.toggle("ccs_col_selected");
            ccs.year = Moment(e.srcElement.id).startOf('year');
            ccs.next(ccs.year);
        });
        m.addEventListener('click', function(e) {
            //
            if (!e.srcElement.classList.contains("ccs_col")) return false;
            //e.srcElement.classList.toggle("ccs_col_selected");
            ccs.month = Moment(e.srcElement.id).startOf('month');
            ccs.next(ccs.month);
        });
        d.addEventListener('click', function(e) {
            if (!e.srcElement.classList.contains("ccs_col")) return false;
            e.srcElement.classList.toggle("ccs_col_selected");
            ccs.day = Moment(e.srcElement.id);
            if (e.srcElement.classList.contains('ccs_col_selected')) {
                ccs.addSelection(ccs.day);
            }else{
                ccs.removeSelection(ccs.day);
            }
            ccs.next(ccs.day);
        });
    }

    module.exports = {
        on: on,
        off: off,
        clickHandler: clickHandler,
        add: addEvents
    }
})();