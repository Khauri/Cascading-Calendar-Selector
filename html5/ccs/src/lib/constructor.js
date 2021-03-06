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