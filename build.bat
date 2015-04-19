type content\core.css > combined.css
type content\button.css >> combined.css
type content\calendar.css >> combined.css
type content\datetimepicker.css >> combined.css
type content\dialog.css >> combined.css
type content\dropdown.css >> combined.css
type content\grid.css >> combined.css
type content\filterbar.css >> combined.css
type content\flattreegrid.css >> combined.css
type content\itemslist.css >> combined.css
type content\pager.css >> combined.css
type content\tabs.css >> combined.css
type content\validation.css >> combined.css
type content\waitarea.css >> combined.css

java -jar yuicompressor-2.4.8.jar --type css -o platformui.2.0.min.css combined.css

uglifyjs scripts\core.js scripts\utils.js scripts\locale.js scripts\remote.js scripts\datasource.js scripts\forms.js scripts\validation.js scripts\waitarea.js scripts\button.js scripts\calendar.js scripts\confirmdialog.js scripts\messagedialog.js scripts\datetimepicker.js scripts\dialog.js scripts\dropdown.js scripts\grid.js scripts\flattreegrid.js scripts\itemslist.js scripts\pager.js scripts\tabs.js -o platformui.2.0.min.js --source-map platformui.2.0.min.js.map -c -m
