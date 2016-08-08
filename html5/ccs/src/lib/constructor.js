module.exports = (function() {
    //require modules
    var Moment = require('moment');
    var CalSection = require('./calsection');
    var events = require('./events');
    var utils = require('../utils/utils');
    var templates = require('./templates');

    var ccs = function(o) {
        //local settings
        if (typeof o != 'object') o = {};
        this.configs = {
            show: {
                today: true, //today's date
                limit: true,
                daysOfWeek: true, //days of the week table head
                doneButton: true, //a 'done' button
                animations: true, //calendar view switch animations
                jumpTo: true, //a search box allowing  one to jump to a particular date
                //to be implemented later
                settings: false,
                multiToggler: false
            },
            limit: Infinity,
            selector: 'ccs',
            name: null,
            order: null,
            //setting smoothScroll to true will add a touch event
            //that generates excess rows and allows traversal by
            //scroll bar
            smoothScroll: true, //not implemented
            style: {
                minWidth: 720,
                minHeight: 400
            },
            range: {
                start: Moment().startOf('year'),
                end: Moment().endOf('year')
            },
            years: {
                selectable: true,
                radius: 100 //200 years
            },
            months: {
                selectable: true,
                consecutive: false
            },
            days: {
                selectable: "SMTWTFZ",
                consecutive: false,
            },
            time: {
                selectable: false,
            },
            start: {
                date: Moment(),
                section: 'days'
            }
        }
        this.today = Moment();
        this.year = null;
        this.month = null;
        this.day = null;
        this.selections = [];
        this.config(o)
        init.call(this);
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

        gotoDate: null,

        addSelection: addSelection,

        removeSelection: removeSelection,

        getSelected: getSelected,

        selections: null
    }

    function config(o) {
        if (typeof o == 'object') {
            utils.extend(this.configs, o);
            var range = this.configs.range,
                start = this.configs.start;
            range.start = Moment(range.start);
            range.end = Moment(range.end);
            start.date = Moment(start.date);
        }
        return this;
    }

    function init() {
        var self = this;
        // create all the shit
        // this should only be run one time probably
        var root_el = document.querySelector(this.configs.selector);
        if (!root_el) root_el = document.createElement('ccs');
        var start_date = self.configs.start.date;

        var years = new CalSection({
                section: "years",
                cols: 4,
                rows: 4,
                format: "YYYY",
                start_date: [start_date.clone(), ["year"]],
                range_start: [start_date.clone(), ["year"]],
                range_end: [start_date.clone(), [10, "years"]]
            }),
            months = new CalSection({
                section: "months",
                cols: 4,
                rows: 4,
                format: "MMM",
                start_date: [start_date.clone(), ["month"]],
                range_start: [start_date.clone(), ["year"]],
                range_end: [start_date.clone(), ["year"]]
            }),
            days = new CalSection({
                section: "days",
                cols: 7,
                rows: 6,
                format: "D",
                start_date: [start_date.clone(), ["month", "week"]],
                range_start: [start_date.clone(), ["month"]],
                range_end: [start_date.clone(), ["month"]]
            });
        //this entire section needs fixing
        events.add(this, years.view, months.view, days.view);
        var table_root = document.createElement('div');
        root_el.appendChild(table_root);
        root_el.parentNode.appendChild(templates.side_bar());
        table_root.classList.add("ccs_tables_cont");
        years.appendTo(table_root);
        months.appendTo(table_root);
        days.appendTo(table_root);

        this.sections = {
            0: years,
            1: months,
            2: days,
            order: [years, months, days],
            curr: 0
        };
        this.switchTo(this.configs.start.section);

        this.view = root_el;

        return this;
    }

    function switchTo(v) {
        var i = 0,
            curr = this.sections[i];
        while (curr) {
            if (curr.section.toLowerCase() == v.toLowerCase()) {
                curr.display(true);
                this.sections.curr = i;
            } else {
                curr.display(false);
            }
            i += 1;
            curr = this.sections[i];
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
        var mmnt = Moment(date);
        if (!this.getSelected(mmnt)) {
            this.selections.push(mmnt);
            return true;
        }
        return false;
    }

    function removeSelection(date) {
        var mmnt = Moment(date);
        var selection = this.getSelected(mmnt)
        if (selection) {
            this.selections.splice(selection.index,1);
            return true;
        }
        return false;
    }

    function getSelected(date) {
        var mmnt = Moment(date);
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