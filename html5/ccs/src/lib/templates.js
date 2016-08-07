(function() {
    module.exports = {
        header: generateHeader,
        footer: generateFooter,
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

    function generateFooter() {
    	var div = docoment.createElement('div');
    	div.classList.add("ccs_footer");
    	//add finished button
    	return div;
    }

    function generateHeader() {

    }
})();