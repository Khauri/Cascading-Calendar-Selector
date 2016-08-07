module.exports = (function() {
    //require modules
    var Moment = require('moment');
    var CalSection = require('./calsection');
    var events = require('./events');
    var utils = require('../utils/utils');

    var ccs = function(o) {
        //local settings
        if (typeof o != 'object') o = {};
        this.configs = {
            show: {
                today: true,
                daysOfWeek: true,
                doneButton: true,
                animations: true,
                //to be implemented later
                settings: false,
                multiToggler: false
            },
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
        this.selections = [{
            start: null,
            end: null,
            color: null
        }];
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
            scroll the current view
        */
        scroll: scroll,
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
                start_date: start_date.clone().startOf('year'),
                start_of: ["year"],
                range_start: start_date.clone(),
                range_end: start_date.clone().add(10, 'years')
            }),
            months = new CalSection({
                section: "months",
                cols: 4,
                rows: 4,
                format: "MMM",
                start_date: start_date.clone().startOf('month'),
                start_of: ["month"],
                range_start: start_date.clone().startOf('year'),
                range_end: start_date.clone().endOf('year')
            }),
            days = new CalSection({
                section: "days",
                cols: 7,
                rows: 6,
                format: "D",
                start_date: start_date.clone(),
                start_of: ["month","week"],
                range_start: start_date.clone().startOf('month'),
                range_end: start_date.clone().endOf('month')
            });

        events.add(this, years.view, months.view, days.view);
        var table_root = document.createElement('div');
        root_el.appendChild(table_root);
        table_root.classList.add("ccs_tables_cont");
        years.appendTo(table_root);
        months.appendTo(table_root);
        days.appendTo(table_root);

        this.sections = {
            0: years,
            1: months,
            2: days,
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
            sect = this.sections[this.sections.curr+1];
        if (sect) {
            this.sections.curr++;
            if(date){
                sect.gotoDate(date);
            }
            curr.fadeOut(function(){
                sect.fadeIn(null, true);
            },true);
        }
    }

    function prev(date) {
        var curr = this.sections[this.sections.curr],
            sect = this.sections[this.sections.curr-1];
        if (sect) {
            this.sections.curr--;
            if(date){
                sect.gotoDate(date);
            }
            curr.fadeOut(function(){
                sect.fadeIn();
            });
        }
    }

    function scroll(amnt) {
        this.sections[this.sections.curr].scroll(amnt);
        return this;
    }

    return ccs;
})();