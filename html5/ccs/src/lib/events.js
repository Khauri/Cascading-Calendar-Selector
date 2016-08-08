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

    function hasClass(el, c) {
        return el.classList.contains(c);
    }
    /**
        this function needs annotation
     */
    function addEvents(ccs) {
        var root_el = ccs.templated.root;
        root_el.addEventListener('click', function(e) {
            src_el = e.target || e.srcElement;
            if (hasClass(src_el, "ccs_col")) {
                if (hasClass(src_el, "ccs_col_days")) {
                    src_el.classList.toggle("ccs_col_selected");
                    var day = Moment(e.srcElement.id);
                    if (hasClass(src_el, 'ccs_col_selected')) {
                        ccs.addSelection(day);
                    } else {
                        ccs.removeSelection(day);
                    }
                    ccs.next(day);
                } else if (hasClass(src_el, "ccs_col_months")) {
                    var month = Moment(src_el.id).startOf('month');
                    ccs.next(month);
                } else if (hasClass(src_el, "ccs_col_years")) {
                    var year = Moment(src_el.id).startOf('year');
                    ccs.next(year);
                }
            } else if (hasClass(src_el, 'ccs_control')) {
                if (hasClass(src_el, 'ccs_back')) {
                    ccs.prev();
                } else if (hasClass(src_el, 'ccs_up')) {
                    ccs.scroll(-1);
                } else if (hasClass(src_el, 'ccs_down')) {
                    ccs.scroll(1);
                }
            } else if (hasClass(src_el, 'ccs_today')) {
                //console.log('Wow');
                ccs.goto(Moment(), 'days', true);
            }
            e.stopPropagation();
        });
    }

    module.exports = {
        on: on,
        off: off,
        clickHandler: clickHandler,
        add: addEvents
    }
})();