(function() {
    var utils = require('../utils/utils');
    module.exports = {
        /*
            adds an event listener
        */
        on: on,
        /*
            removes an event listener given its handler
        */
        off: off,
        /*
            an internal function that adds events to 
        */
        add: addEvents
    }
    /*
        an object containing lists of events to run through in the
        order in which they were added
    */
    var events = {
        select: [],
        deselect: [],
        switchView: [],
        complete: [],
        clear: [],
    }

    function runEvents(type, data, cb) {
        if (typeof type == "string" && events[type]) {
            var event = {
                type: type,
                cancel: false,
            }
            if (typeof data == "object") {
                utils.extend(event, data);
            } else {
                event.data = data;
            }
            var e = events[type];
            for (var i = 0; i < e.length; i++) {
                var result = e[i](event);
            }
        }
        if(typeof cb == "function") cb(event);
    }

    function on(type, handler) {
        if (typeof type == "string" && events[type]) {
            if (typeof handler == "function") {
                events[type].push(handler);
            }
        }
        return this;
    }

    function off(type, handler) {
        if (typeof type == "string" && events[type]) {
            for (var i = 0; i < events[type].length; i++) {
                if (events[type][i] == handler) {
                    events[type].splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    }

    /**
        checks if an element contains a certain class
        might be more useful in utils tbh
    */
    function hasClass(el, c) {
        return el.classList ?
            el.classList.contains(c) :
            (el.className.split(" ").indexOf(c) != -1);
    }
    /**
        this function needs more comments probably lmao
     */
    function addEvents(ccs) {
        var dragging = false,
            start_el, selected, docs;
        var root_el = ccs.templated.root.parentNode;
        root_el.addEventListener('click', function(e) {
            src_el = e.target || e.srcElement;
            /*
                handle the column calendar elements
                such as the days, years, and months
             */
            if (hasClass(src_el, "ccs_col")) {
                if (hasClass(src_el, "ccs_col_months")) {
                    var month = moment(src_el.id).startOf('month');
                    ccs.next(month);
                } else if (hasClass(src_el, "ccs_col_years")) {
                    var year = moment(src_el.id).startOf('year');
                    ccs.next(year);
                }
            }
            /*
                handle some of the controls
             */
            else if (hasClass(src_el, 'ccs_control')) {
                if (hasClass(src_el, 'ccs_back')) {
                    ccs.prev();
                } else if (hasClass(src_el, 'ccs_up')) {
                    ccs.scroll(-1);
                } else if (hasClass(src_el, 'ccs_down')) {
                    ccs.scroll(1);
                }
            } else if (hasClass(src_el, 'ccs_today')) {
                //console.log('Wow');
                ccs.goto(moment(), 'days', true);
            }
            e.stopPropagation();
        });
        //drag over dates and such
        root_el.addEventListener("mousedown",function(e){
            selected = [];
            src_el = e.target || e.srcElement;
            if(hasClass(src_el, "ccs_col_days")){
                docs = root_el.querySelectorAll(".ccs_col_days");
                src_el.classList.toggle("ccs_col_selected");
                start_el = src_el;
                dragging = true;
            }
        });
        root_el.addEventListener("mouseup",function(e){
            if(!dragging) return false;
            if (hasClass(src_el, "ccs_col_days")) {
                var day = moment(e.srcElement.id);
                if (hasClass(src_el, 'ccs_col_selected')) {
                    runEvents('select', {
                        //selection: day
                    });
                    ccs.addSelection(day);
                } else {
                    runEvents('deselect', {
                        //selection: day
                    });
                    ccs.removeSelection(day);
                }
                ccs.next(day);
                dragging = false;
            }
        });

        root_el.addEventListener("mousemove",function(e){
            src_el = e.target || e.srcElement;
            if(src_el == start_el || !dragging) return false;
            if(hasClass(src_el, "ccs_col_days")){
                //get all td between this one and start_el
                var populating = false, 
                    doc;
                for(var i=0;i<docs.length;i++){
                    doc = docs[i];
                    if(doc == src_el || doc == start_el){
                        populating = !populating;
                    }
                    if(populating){
                        if(start_el.classList.contains("ccs_col_selected")){
                            doc.classList.add("ccs_col_selected");
                        }else{
                            doc.classList.remove("ccs_col_selected");
                        }//doc.classList.toggle("ccs_col_selected");
                    }else{
                        doc.classList.remove("ccs_col_selected");
                    }
                }

            }
        });
    }
})();