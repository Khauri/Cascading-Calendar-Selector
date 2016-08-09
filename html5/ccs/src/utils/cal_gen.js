(function() {
    var templates = require('../lib/templates')
    /* The real question is: which is faster, generating via this small template engine
        or manually generating everything? The world may never know...*/
    var template = {
        "div.ccs_datePicker#datepicker": {
            "div.ccs_today#today": {},
            "div.ccs_controls#controls": {
                "p.ccs_control.ccs_back#back": {},
                "p.ccs_control.ccs_down#down":{},
                "p.ccs_control.ccs_up#up": {}
            },
            "div.ccs_tables_cont#tables": {}
        },
        "div.ccs_sideBar#sidebar": {
            "ul.ccs_tabs#tabs":{},
            "ul.ccs_selections#selections":{}
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
            s = s.substring(0,s.indexOf("#"));
            var parsed = s.split(".");
            obj.root = newElement(parsed[0], parsed.slice(1));
            for (var i = 0, len = keys.length; i < len; i++) {
                el = helper(obj[keys[i]], keys[i]);
                if(el){
                    obj.root.appendChild(el);
                }
            }
            return obj.root;
        }
        helper(template, "ccs_root");
        template.findById = findById;
        return template;
    }

    function findById(id){
        function helper(obj){
            var keys = Object.keys(obj);
            for(var i=0;i<keys.length;i++){
                if(keys[i].substring(keys[i].indexOf("#")+1) == id) return obj[keys[i]];
                val = helper(obj[keys[i]]);
                if(val) return val;
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