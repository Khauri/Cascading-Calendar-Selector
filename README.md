# Cascading-Calendar-Selector
The Cascading Calendar Selector (CCS) is a method of streamlining date and time selection in mobile and web applications. It aims to be a hybrid between a date picker and general calendar.

## Set it up
Include the CSS and Javascript files:
```html
<link rel="/path/to/ccs_style.css">
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
