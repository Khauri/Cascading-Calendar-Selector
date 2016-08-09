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
                doc.id = this.pointers.start.format();
            } else {
                doc.innerHTML = this.pointers.end.format(this.format);
                doc.id = this.pointers.end.format();
                if (!dateInRange(this.pointers.end, this.range.start, this.range.end)) doc.classList.add("ccs_col_oor");
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
            this.pointers.end.add(1, this.section);
        }
    }

    module.exports = CalSection;
})();