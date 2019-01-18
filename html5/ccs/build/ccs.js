(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CCS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if(window && window.moment && typeof window.moment == "function"){
	var ccs = require('./factory');
	module.exports = ccs;
}else{
	throw "CCS relies on the Moment library: http://momentjs.com/";
}
},{"./factory":2}],2:[function(require,module,exports){
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

    function config(o){
        utils.extend(this.configs, o);
        return this;
    }

    function create(options) {
        var cal = new ccs(options);
        cal.factory = this;
        this.calendars.push(cal);
        return cal;
    }
    
    return new ccs_factory();
})();
},{"./lib/constructor":4,"./utils/utils":9}],3:[function(require,module,exports){
(function() {
    var utils = require('../utils/utils');
    generate = utils.generate;

    function dateInRange(date, start, end) {
        var date = moment(date);
        return date.isBetween(start, end, null, '[]');
    }

    function getStartOf(date, ranges) {
        if (ranges) {
            for (var i = 0; i < ranges.length; i++) {
                date = date.startOf(ranges[i]);
            }
        }
        return date;
    }

    function getEndOf(date, ranges) {
        if (ranges) {
            for (var i = 0; i < ranges.length; i++) {
                if (typeof ranges[i] == "number") {
                    date = date.add(ranges[i], ranges[i + 1]);
                    return date;
                } else {
                    date = date.endOf(ranges[i]);
                }
            }
        }
        return date;
    }
    //var CalSection = function(type, ccs, prev) {
    var CalSection = function(p) {
        this.section = p.section;
        this.cal = p.cal;
        this.format = p.format;
        this.rows = p.rows || 1;
        this.cols = p.cols || 1;
        this.start_date = p.start_date[0] || moment();
        this.start_of = p.start_date[1] || [];
        this.trackSelected = p.trackSelected || false;
        this.range = {
            start: getStartOf(p.range_start[0], p.range_start[1]),
            end: getEndOf(p.range_end[0], p.range_end[1]),
            start_getter: p.range_start[1],
            end_getter: p.range_end[1]
        }

        this.pointers = {
            start: null,
            end: null
        }
        var data = generate.table(this.rows, "ccs_table ccs_table_" + this.section);
        this.view = data.table;
        this.table = data;
        this.gotoDate(this.start_date, false);
    }

    CalSection.prototype = {
        /**
            append this section of the calendar 
        */
        appendTo: function(parent) {
            parent.appendChild(this.view);
        },
        /** 
        	toggles the selectability of the calendar
         */
        toggle: toggle,
        /**
         
         */
        display: display,

        fadeOut: fadeOut,

        fadeIn: fadeIn,
        /**
            scroll this section of the calendar up or down
            negative numbers scroll back, positive scroll forward
        */
        scroll: scroll,
        /**
            Jump this secton of the calendar to a particular date
        */
        gotoDate: gotoDate,
    }

    function toggle() {
        this.enabled = !this.enabled;
    }

    function display(val) {
        if (typeof val == "undefined") { //toggle
            this.view.hidden = !this.view.hidden;
        } else {
            this.view.hidden = !val;
        }
    }

    function fadeOut(cb, t) {
        var self = this;
        var player = this.view.animate({
            opacity: [1, 0],
            transform: ["scale(1)", "scale(" + (t ? 1.25 : .75) + ")"]
        }, {
            duration: 150,
            easing: "ease-in-out",
        });
        player.onfinish = function() {
            self.display(false);
            try {
                cb();
            } catch (e) {

            }
        }
    }

    function fadeIn(cb, t) {
        var self = this;
        self.display(true);
        var player = this.view.animate({
            opacity: [0, 1],
            transform: ["scale(" + (t ? .75 : 1.25) + ")", "scale(1)"]
        }, {
            duration: 150,
            easing: "ease-in-out",
        });
        player.onfinish = function() {
            try {
                cb();
            } catch (e) {}
        }
    }

    function scroll(rows) {
        var data = generate.rows(this.cols, Math.abs(rows), "ccs_col ccs_col_" + this.section, "ccs_row ccs_row_" + this.section);
        var backwards = (rows < 0);

        var start = backwards ? data.docs.length - 1 : 0,
            end = backwards ? -1 : data.docs.length,
            iterator = backwards ? -1 : 1;

        for (var i = start; i != end; i += iterator) {
            doc = data.docs[i];
            if (backwards) {
                this.pointers.start.subtract(1, this.section);
                this.pointers.end.subtract(1, this.section);
                doc.innerHTML = this.pointers.start.format(this.format);
                if (!dateInRange(this.pointers.start, this.range.start, this.range.end)) doc.classList.add("ccs_col_oor");
                if(this.trackSelected && this.cal.getSelected(this.pointers.start)) doc.classList.add("ccs_col_selected");
                doc.id = this.pointers.start.format();
            } else {
                doc.innerHTML = this.pointers.end.format(this.format);
                doc.id = this.pointers.end.format();
                if (!dateInRange(this.pointers.end, this.range.start, this.range.end)) doc.classList.add("ccs_col_oor");
                if(this.trackSelected && this.cal.getSelected(this.pointers.end)) doc.classList.add("ccs_col_selected");
                this.pointers.start.add(1, this.section);
                this.pointers.end.add(1, this.section);
            }
        }

        start = backwards ? data.rows.length - 1 : 0;
        end = backwards ? -1 : data.rows.length;
        for (var i = start; i != end; i += iterator) {
            if (backwards) {
                this.table.body.insertBefore(data.rows[i], this.table.body.firstChild);
                this.table.body.removeChild(this.table.body.lastChild);
            } else {
                this.table.body.appendChild(data.rows[i]);
                this.table.body.removeChild(this.table.body.firstChild);
            }
        }
        return this;
    }
    /** jumps to a particular date 
    	animate given a duration
    */
    function gotoDate(mmnt, animate, anim_type) {
        var date = moment(mmnt);
        this.range.start = getStartOf(date.clone(),this.range.start_getter);
        this.range.end = getEndOf(date.clone(),this.range.end_getter);
        //edge case
        date = getStartOf(date, this.start_of);
        this.pointers.start = date.clone();
        this.pointers.end = date.clone();
        var rows = generate.rows(this.cols, this.rows, "ccs_col ccs_col_" + this.section, "ccs_row ccs_row_" + this.section);
        //clear the table
        this.table.body.innerHTML = "";
        //append the rows one by one
        for (var i = 0; i < rows.rows.length; i++) {
            this.table.body.appendChild(rows.rows[i]);
        }
        var doc;
        for (var i = 0; i < rows.docs.length; i++) {
            doc = rows.docs[i];
            doc.id = this.pointers.end.format();
            doc.innerHTML = this.pointers.end.format(this.format);
            if (!dateInRange(this.pointers.end, this.range.start, this.range.end)) doc.classList.add("ccs_col_oor");
            if(this.trackSelected && this.cal.getSelected(date)) doc.classList.add("ccs_col_selected");
            this.pointers.end.add(1, this.section);
        }
    }

    module.exports = CalSection;
})();
},{"../utils/utils":9}],4:[function(require,module,exports){
module.exports = (function() {
    //require modules
    var utils = require('../utils/utils');
    var CalSection = require('./calsection');
    var templates = require('./templates');
    var events = require('./events');

    var ccs = function(o) {
        var t0 = performance.now();
        //begin initalization
        if (typeof o != 'object') o = {};
        this.configs = {
            show: {
                today: true, //today's date
                limit: false,
                daysOfWeek: true, //days of the week table head
                doneButton: true, //a 'done' button
                animations: true, //calendar view switch animations
                jumpTo: true, //a search box allowing  one to jump to a particular date
                border: true,
                background: true,
                //to be implemented later
                settings: false,
                multiToggler: false
            },
            limit: Infinity,
            selector: 'ccs',
            name: null,
            order: null,
            smoothScroll: true, //not implemented in this version probably
            style: {
                minWidth: 720,
                minHeight: 400
            },
            years: {
                selectable: true,
                range: {
                    start: moment().subtract(100, "years"),
                    end: moment().add(100, "years")
                } //200 years
            },
            months: {
                selectable: true,
                consecutive: false
            },
            days: {
                selectable: "SMTWTFZ",
                consecutive: false,
            },
            time: { //not yet implemented
                selectable: false,
            },
            start: {
                date: moment(),
                section: 'days'
            }
        }

        this.today = moment();

        this.selections = [];

        this.config(o)

        init.call(this);
        //end initialization
        var t1 = performance.now();
        //time to initialization
        this.tti = t1-t0;
        console.log("Time to initialize: ~"+ Math.round(this.tti)+"ms");
    }

    ccs.prototype = {
        /**
            configure some settings of the calendar
         */
        config: config,
        /** 
         */
        switchTo: switchTo,
        /**
            switch to the next view if it exists
        */
        next: next,
        /**
            switch to the previous view if it exists
        */
        prev: prev,
        /**
            scroll the current view up or downw
        */
        scroll: scroll,

        goto: go,

        addSelection: addSelection,
        /**
            TODO: Remake the calendar based on new configurations
         */
        update: update,

        removeSelection: removeSelection,

        getSelected: getSelected,

        currentView: currV,
        /**
            Adds an event handler
        */
        on: events.on,
        /**
            Removes an event handler
        */
        off: events.off,
    }

    function config(o) {
        if (typeof o == 'object') {
            utils.extend(this.configs, o);
        }
        return this;
    }

    function init() {
        var self = this;
        /* create all the shit
          this should only be run one time probably, whch
          is why it's not a method of the constructor
        */
        this.templated = utils.generate.calendar();
        
        var root_el = document.querySelector(this.configs.selector);

        if (!root_el) root_el = document.createElement('ccs');
        root_el.appendChild(this.templated.root);

        var start_date = self.configs.start.date;

        var years = new CalSection({
                cal: self,
                section: "years",
                cols: 4,
                rows: 4,
                format: "YYYY",
                start_date: [start_date.clone(), ["year"]],
                range_start: [start_date.clone(), ["year"]],
                range_end: [start_date.clone(), [10, "years"]]
            }),
            months = new CalSection({
                cal: self,
                section: "months",
                cols: 4,
                rows: 4,
                format: "MMM",
                start_date: [start_date.clone(), ["month"]],
                range_start: [start_date.clone(), ["year"]],
                range_end: [start_date.clone(), ["year"]]
            }),
            days = new CalSection({
                cal: self,
                section: "days",
                cols: 7,
                rows: 6,
                format: "D",
                trackSelected: true,
                start_date: [start_date.clone(), ["month", "week"]],
                range_start: [start_date.clone(), ["month"]],
                range_end: [start_date.clone(), ["month"]]
            });

        var table_root = this.templated.findById("tables").root;
        years.appendTo(table_root);
        months.appendTo(table_root);
        days.appendTo(table_root);
        //turn on optional features
        this.templated.findById("today").root.innerHTML = moment().format("dddd, MMM D, YYYY");
        this.templated.findById("up").root.innerHTML = "Up";
        this.templated.findById("down").root.innerHTML = "Down";
        this.templated.findById("back").root.innerHTML = "Back";

        this.sections = {
            0: years,
            1: months,
            2: days,
            order: [years, months, days],
            curr: 0
        };

        this.sectionStack = [];
        this.switchTo(this.configs.start.section);

        this.view = root_el;

        //add events and such
        events.add(this);

        return this;
    }

    function update() {
        /*update the selections*/
        var ul = document.querySelector(".ccs_selections");
        if (ul) {
            while (ul.firstChild) {
                ul.removeChild(ul.firstChild);
            }
            var li;
            for (var i = 0; i < this.selections.length; i++) {
                li = document.createElement("li");
                li.innerHTML = this.selections[i].format("dddd, MMM D, YYYY");
                ul.appendChild(li);
            }
        }
    }

    function currV() {
        return this.sections[this.sections.curr];
    }

    function switchTo(v, hide) {
        var i = 0,
            curr = this.sections[i];
        while (curr) {
            if (curr.section.toLowerCase() == v.toLowerCase()) {
                if (!hide) curr.display(true);
                this.sections.curr = i;
            } else {
                curr.display(false);
            }
            i += 1;
            curr = this.sections[i];
        }
        return this;
    }

    function go(date, section, animate) {
        var self = this;

        function switchIt() {
            if (section) self.switchTo(section, true);
            self.sections[self.sections.curr].gotoDate(date);
            if (animate) {
                self.sections[self.sections.curr].fadeIn(null, true);
            }
        }
        if (animate) {
            this.sections[this.sections.curr].fadeOut(switchIt, true);
        } else {
            switchIt();
        }
        return this;
    }

    function next(date) {
        var curr = this.sections[this.sections.curr],
            sect = this.sections[this.sections.curr + 1];
        if (sect) {
            this.sections.curr++;
            if (date) {
                sect.gotoDate(date);
            }
            curr.fadeOut(function() {
                sect.fadeIn(null, true);
            }, true);
        }
    }

    function prev(date) {
        var curr = this.sections[this.sections.curr],
            sect = this.sections[this.sections.curr - 1];
        if (sect) {
            this.sections.curr--;
            if (date) {
                sect.gotoDate(date);
            }
            curr.fadeOut(function() {
                sect.fadeIn();
            });
        }
    }

    function scroll(amnt) {
        this.sections[this.sections.curr].scroll(amnt);
        return this;
    }

    function addSelection(date) {
        var mmnt = moment(date);
        if (!this.getSelected(mmnt)) {
            this.selections.push(mmnt);
            this.update();
            return true;
        }
        return false;
    }

    function removeSelection(date) {
        var mmnt = moment(date);
        var selection = this.getSelected(mmnt)
        if (selection) {
            this.selections.splice(selection.index, 1);
            this.update();
            return true;
        }
        return false;
    }

    function getSelected(date) {
        var mmnt = moment(date);
        for (var i = 0; i < this.selections.length; i++) {
            if (this.selections[i].isSame(mmnt)) {
                return {
                    date: this.selections[i],
                    index: i
                };
            }
        }
        return false;
    }

    return ccs;
})();
},{"../utils/utils":9,"./calsection":3,"./events":5,"./templates":6}],5:[function(require,module,exports){
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
},{"../utils/utils":9}],6:[function(require,module,exports){
(function() {
    module.exports = {
        days_head: generateDaysHeader,
    }

    function generateDaysHeader(table) {
        var head = document.createElement('thead'),
            th;
        var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            day;
        for (var i = 0; i < days.length; i++) {
            day = days[i];
            th = document.createElement('th');
            th.innerHTML = day;
            head.appendChild(th);
        }
        //table.appendChild(head);
        return head;
    }

})();
},{}],7:[function(require,module,exports){
(function() {
    var templates = require('../lib/templates')
        /* The real question is: which is faster, generating via this small template engine
        or manually generating everything? The world may never know...*/
    var template = {
        "div.ccs_datePicker#datepicker": {
            "div.ccs_today#today": {},
            "div.ccs_controls#controls": {
                "p.ccs_control.ccs_back#back": {},
                "p.ccs_control.ccs_down#down": {},
                "p.ccs_control.ccs_up#up": {}
            },
            "div.ccs_tables_cont#tables": {}
        },
        "div.ccs_sideBar#sidebar": {
            "ul.ccs_tabs#tabs": {
                "li.ccs_tab#datelist": {
                    "ul.ccs_selections#selections": {},
                },
                "li.ccs_tab#time":{},
            },
            "div.ccs_footer#footer": {
                "div.ccs_done_button#done": {}
            },
        }
    };

    function newElement(type, classes) {
        try {
            var el = document.createElement(type);
        } catch (err) {
            var el = document.createElement('div');
        }
        for (var i = 0, length = classes.length; i < length; i++) {
            el.classList.add(classes[i]);
        }
        return el;
    }

    function generateTemplate() {
        function helper(obj, s) {
            if (!obj || typeof obj == "function") {
                return null;
            }
            if (typeof obj == "string") {
                return document.createTextNode(obj);
            }
            var keys = Object.keys(obj);
            s = s.substring(0, s.indexOf("#"));
            var parsed = s.split(".");
            obj.root = newElement(parsed[0], parsed.slice(1));
            for (var i = 0, len = keys.length; i < len; i++) {
                el = helper(obj[keys[i]], keys[i]);
                if (el) {
                    obj.root.appendChild(el);
                }
            }
            return obj.root;
        }
        helper(template, "div.ccs_root#root");
        template.findById = findById;
        return template;
    }

    function findById(id) {
        function helper(obj) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].substring(keys[i].indexOf("#") + 1) == id) return obj[keys[i]];
                val = helper(obj[keys[i]]);
                if (val) return val;
            }
            return null;
        }
        return helper(template);
    }

    function createTable(cols, classes) {
        var table = document.createElement('table');
        table.className += classes;
        var body = document.createElement('tbody');
        if (classes.indexOf("days") > -1) {
            var head = templates.days_head();
        } else {
            var head = document.createElement('thead');
        }
        table.appendChild(head);
        table.appendChild(body);
        return {
            table: table,
            head: head,
            body: body,
        };
    }

    function createRows(width, height, doc_class, row_class) {
        var rows = [],
            docs = [],
            tr, td;
        for (var i = 0; i < height; i++) {
            tr = document.createElement('tr');
            tr.className += row_class;
            rows.push(tr);
            for (var j = 0; j < width; j++) {
                td = document.createElement('td');
                td.className += doc_class
                docs.push(td);
                tr.appendChild(td);
            }
        }
        return {
            rows: rows,
            docs: docs
        }
    }

    module.exports = {
        table: createTable,
        rows: createRows,
        calendar: generateTemplate,
    };

})();
},{"../lib/templates":6}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
module.exports = {
	extend: require('./obj_extend'),
	generate: require('./cal_gen')
}
},{"./cal_gen":7,"./obj_extend":8}]},{},[1])(1)
});