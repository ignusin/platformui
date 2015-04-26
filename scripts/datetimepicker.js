(function (ns) {
    
    ns.DatePicker = function (element) {

        if (element)
            this._el = $(ns.element(element));
        else
            this._el = $('<div></div>');


        this._calendar = null;
        this._dropDown = null;

        this._events = {
            selectedDateChanged: [],
            inputValueChanged: []
        };


        this._initControl();
    };

    ns.DatePicker.prototype = {
        _initControl: function () {
            var _this = this;

            var calendarEl = $('<div></div>');

            _this._calendar = new ns.Calendar(calendarEl);
            _this._calendar.onSelectedDateChanged(function () { _this._calendar_selectedDateChanged(); });

            var selectedDate = new Date();
            _this._dropDown = new ns.DropDown(_this._el, calendarEl);
            _this._dropDown.setText(ns.formatDate(selectedDate));
        },

        _calendar_selectedDateChanged: function () {
            var _this = this;

            window.setTimeout(function () {
                _this._dropDown.hide();

                var selectedDate = _this._calendar.getSelectedDate();
                _this._dropDown.setText(ns.formatDate(selectedDate));

                _this._fireSelectedDateChanged();
            }, 100);
        },

        _fireSelectedDateChanged: function () {
            var _this = this;

            var i;

            for (i = 0; i < _this._events.selectedDateChanged.length; ++i)
                _this._events.selectedDateChanged[i]();

            for (i = 0; i < _this._events.inputValueChanged.length; ++i)
                _this._events.inputValueChanged[i]();
        },

        getSelectedDate: function () {
            var _this = this;

            return _this._calendar.getSelectedDate();
        },

        setSelectedDate: function (date) {
            var _this = this;

            if (!date) {
                date = new Date();
            }

            _this._calendar.setSelectedDate(date);
            _this._dropDown.setText(ns.formatDate(date));
        },

        onSelectedDateChanged: function (handler) {
            var _this = this;

            _this._events.selectedDateChanged.push(handler);
        },

        onInputValueChanged: function (handler) {
            var _this = this;

            _this._events.inputValueChanged.push(handler);
        },

        setEnabled: function (enabled) {
            var _this = this;

            _this._dropDown.setEnabled(enabled);
        },

        isEnabled: function () {
            var _this = this;

            return _this._dropDown.isEnabled();
        },

        setInputValue: function (value) {
            var _this = this;

            _this.setSelectedDate(value ? ns.parseDate(value) : null);
        },

        getInputValue: function () {
            var _this = this;

            return ns.formatDate(_this.getSelectedDate());
        },

        getElement: function () {
            var _this = this;

            return _this._el;
        }
    };


    ns.TimePicker = function (element) {

        if (element)
            this._el = $(ns.element(element));
        else
            this._el = $('<div></div>');

        this._minuteDropDown = null;
        this._hourDropDown = null;

        this._events = {
            selectedTimeChanged: []
        };


        this._initControl();
    };

    ns.TimePicker.prototype = {
        _initControl: function () {
            var _this = this;
            var i, item, displayItem, text, value;


            var minuteDdlEl = $('<div style="display:inline-block"></div>');
            _this._minuteDropDown = new ns.DropDownItemsList(minuteDdlEl);

            for (i = 0; i < 12; ++i) {
                value = (i * 5).toString();
                if (value.length === 1)
                    value = '0' + value;

                item = $('<div class="ns-TimePickerItem"></div>');
                item.text(value);

                displayItem = $('<div class="ns-TimePickerDisplayItem"></div>');
                displayItem.text(value);

                _this._minuteDropDown.addItem(item, displayItem);
            }

            _this._minuteDropDown.setSelectedIndex(0);
            _this._minuteDropDown.onSelectedIndexChanged(
                    function () { _this._dropDown_SelectedIndexChanged(); });


            var hourDdlEl = $('<div style="display: inline-block"></div>');
            _this._hourDropDown = new ns.DropDownItemsList(hourDdlEl);

            for (i = 0; i < 24; ++i) {
                value = i.toString();
                if (value.length === 1)
                    value = '0' + value;

                item = $('<div class="ns-TimePickerItem"></div>');
                item.text(value);

                displayItem = $('<div class="ns-TimePickerDisplayItem"></div>');
                displayItem.text(value);

                _this._hourDropDown.addItem(item, displayItem);
            }

            _this._hourDropDown.setSelectedIndex(0);
            _this._hourDropDown.onSelectedIndexChanged(
                    function () { _this._dropDown_SelectedIndexChanged(); });


            var sepEl = $('<div class="ns-TimePickerSeparator"></div>');
            sepEl.text(':');

            _this._el.append(hourDdlEl);
            _this._el.append(sepEl);
            _this._el.append(minuteDdlEl);
        },

        _dropDown_SelectedIndexChanged: function () {
            var _this = this;

            _this._fireSelectedTimeChanged();
        },

        _fireSelectedTimeChanged: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.selectedTimeChanged.length; ++i)
                _this._events.selectedTimeChanged[i]();
        },

        onSelectedTimeChanged: function (handler) {
            var _this = this;

            _this._events.selectedTimeChanged.push(handler);
        },

        getSelectedTime: function () {
            var _this = this;

            var date = new Date(0, 0, 0,
                _this._hourDropDown.getSelectedIndex(),
                _this._minuteDropDown.getSelectedIndex() * 5);
            return date;
        },

        setSelectedTime: function (date) {
            var _this = this;

            _this._hourDropDown.setSelectedIndex(date.getHours());

            var minuteIndex = Math.round(date.getMinutes() / 5);
            if (minuteIndex >= 12) minuteIndex = 11;
            _this._minuteDropDown.setSelectedIndex(minuteIndex);
        },

        setEnabled: function (enabled) {
            var _this = this;

            _this._hourDropDown.setEnabled(enabled);
            _this._minuteDropDown.setEnabled(enabled);
        },

        isEnabled: function () {
            var _this = this;

            return _this._hourDropDown.isEnabled();
        },

        getElement: function () {
            var _this = this;

            return _this._el;
        }
    };


    ns.DateTimePicker = function (element) {
        if (element)
            this._el = $(ns.element(element));
        else
            this._el = $('<div></div>');

        this._timePicker = null;
        this._datePicker = null;

        this._events = {
            selectedDateChanged: []
        };


        this._initControl();
    };

    ns.DateTimePicker.prototype = {

        _initControl: function () {
            var _this = this;

            var datePickerEl = $('<div style="display: inline-block"></div>');
            var timePickerEl = $('<div style="display: inline-block"></div>');
            var sepEl = $('<div class="ns-DateTimePicker-Separator"></div>');


            _this._datePicker = new ns.DatePicker(datePickerEl);
            _this._datePicker.onSelectedDateChanged(function () { _this._onSelectedDateChanged(); });
            _this._timePicker = new ns.TimePicker(timePickerEl);
            _this._timePicker.onSelectedTimeChanged(function () { _this._onSelectedDateChanged(); });

            _this._el.append(datePickerEl);
            _this._el.append(sepEl);
            _this._el.append(timePickerEl);
        },

        _onSelectedDateChanged: function () {
            var _this = this;

            _this._fireSelectedDateChanged();
        },

        _fireSelectedDateChanged: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.selectedDateChanged.length; ++i)
                _this._events.selectedDateChanged[i]();
        },

        onSelectedDateChanged: function (handler) {
            var _this = this;

            _this._events.selectedDateChanged.push(handler);
        },

        setSelectedDate: function (value) {
            var _this = this;

            _this._datePicker.setSelectedDate(value);
            _this._timePicker.setSelectedTime(value);
        },

        getSelectedDate: function () {
            var _this = this;

            var date = _this._datePicker.getSelectedDate();
            var time = _this._timePicker.getSelectedTime();

            var result = new Date(date.getFullYear(), date.getMonth(),
                date.getDate(), time.getHours(), time.getMinutes());
            return result;
        },

        setEnabled: function (enabled) {
            var _this = this;

            _this._datePicker.setEnabled(enabled);
            _this._timePicker.setEnabled(enabled);
        },

        isEnabled: function () {
            var _this = this;

            return _this._datePicker.isEnabled();
        },

        getElement: function () {
            var _this = this;

            return _this._el;
        }
    };
    
} (PlatformUI));