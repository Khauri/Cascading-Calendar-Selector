# HTML5
The HTML5 CCS is perfect for web applications where the user might need to pick several dates and times all at once and then pass those dates to another part of the application.

## Set it up
Include the CSS and Javascript files:
```html
<!-- stylesheet for cuteness -->
<link href="/path/to/ccs_style.css" rel="stylesheet">
<!-- momentjs for timeliness -->
<script src="path/to/moment.js"></script>
<!-- and the centerpiece -->
<script src="/path/to/ccs.js"></script>
```
Create the root element in which the calendar will be appended (defaults to "ccs")
```html
<ccs></ccs>
```
Initialize and configure
```javascript
var cal = CCS.create({...});
//or
var cal = CCS.create().config({...});
```
## Configurations
```javascript
//pass these into the configurations
show: {
	today: Boolean, //today's date
	limit: Boolean, //amount of dates able to be chosen
	daysOfWeek: Boolean, //days of the week table head
	doneButton: Boolean, //the 'done' button
	animations: Boolean, //calendar view switch animations
	jumpTo: Boolean, //a search box allowing  one to jump to a particular date
	border: Boolean, //border around the table
	background: Boolean, //enable or disable the background
	settings: Boolean, //show settings toggle/module
	multiToggler: Boolean //
},
limit: Number, //the number of dates able to be chosen
selector: String, //
name: String, //the name to display on the table, if any
order: String,
smoothScroll: Boolean,
years: {
    selectable: Boolean,
    range:{
        start: moment*,
        end: moment*
    }
},
months: {
    selectable: Boolean,
    consecutive: Boolean
},
days: {
    selectable: String,
    consecutive: Boolean,
},
time: {
    selectable: Boolean,
},
start: {
    date: moment*,
    section: String
}
```
*Any value you can pass into a moment object may be passed here such as a Date, String, Number, or moment. See momentjs docs for more information.
## Methods
```javascript

```
## Events

###select

###deselect
