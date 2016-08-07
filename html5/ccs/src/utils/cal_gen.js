(function() {
    var events = require('../lib/events');
    var templates = require('../lib/templates')
        //should we create a whole new table?
        /* Create a table */

    function createTable(cols, classes) {
        var table = document.createElement('table');
        table.className += classes;
        var body = document.createElement('tbody');
        if (classes.indexOf("days") > -1) {
            var head = templates.days_head();
        }else{
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
    /* adds classes to a batch of elements */
    function ac(el_arr, classes) {
        for (var i = 0; i < el_arr.length; i++) {
            el_arr[i].className += classes;
        }
    }

    module.exports = {
        table: createTable,
        rows: createRows,
        classes: ac
    };

})();