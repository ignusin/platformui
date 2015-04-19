(function (ns) {

    ns.Calendar = function (element) {

        if (element)
            this._element = $(ns.element(element));
        else
            this._element = $('<div></div>');

        this._selectedDate = null;
        this._currentYear = null;
        this._currentMonth = null;
        this._headerEl = null;
        this._bodyEl = null;
        this._yearLabel = null;
        this._monthDdl = null;

        this._startDayOfWeek = 1;

        this._events = {
            selectedDateChanged: []
        };


        this._initCurrentDate();
        this._initControl();
        this._updateYearLabel();
        this._updateMonthDdl();
        this._recreateMonthView();
    };


    ns.Calendar.prototype = {

        _initCurrentDate: function () {
            var _this = this;        

            var today = new Date();
            _this._currentYear = today.getFullYear();
            _this._currentMonth = today.getMonth();
            _this._selectedDate = today;
        },

        _initControl: function () {
            var _this = this;

            _this._createHeaderControls();

            var bodyEl = $('<div class="PlatformUI-Body"></div>');
            _this._bodyEl = bodyEl;

            _this._element.addClass('PlatformUI-Control');
            _this._element.addClass('PlatformUI-Calendar');
            _this._element.append(_this._headerEl);
            _this._element.append(_this._bodyEl);
        },

        _createHeaderControls: function () {      
            var _this = this;

            var headerEl = $('<div class="PlatformUI-Header"></div>');

            var monthDdl = $('<select class="PlatformUI-MonthList"></select>');
            monthDdl.change(function () { _this._monthDdl_Change(); });

            var i, monthItem, text;
            for (i = 0; i < 12; ++i) {
                monthItem = ns.createElement('option');

                text = ns.createText(ns.Locale.monthNames[i]);
                monthItem.appendChild(text);

                monthDdl.append(monthItem);
            }

            headerEl.append(monthDdl);


            var prevYearButton = $('<a href="javascript:void(0)" class="PlatformUI-PrevYearButton">&lt;&lt;</a>');
            prevYearButton.click(function () {
                _this._prevYearButton_Click();
            });
            headerEl.append(prevYearButton);

            var yearLabel = $('<span class="PlatformUI-YearLabel"></span>');
            headerEl.append(yearLabel);

            var nextYearButton = $('<a href="javascript:void(0)" class="PlatformUI-NextYearButton">&gt;&gt;</a>');
            nextYearButton.click(function () {
                _this._nextYearButton_Click();
            });
            headerEl.append(nextYearButton);


            _this._headerEl = headerEl;
            _this._yearLabel = yearLabel;
            _this._monthDdl = monthDdl;
        },

        _updateYearLabel: function () {
            var _this = this;

            _this._yearLabel.text(_this._currentYear.toString());
        },

        _updateMonthDdl: function () {
            var _this = this;

            _this._monthDdl.prop('selectedIndex', _this._currentMonth);
        },

        _daysInMonth: function (year, month) {
            return new Date(year, month + 1, 0).getDate();
        },

        _firstWeekDayOfMonth: function (year, month) {
            return new Date(year, month, 1).getDay();
        },

        _recreateMonthView: function () {
            var _this = this;

            _this._bodyEl.empty();


            var grid = $('<table class="PlatformUI-MonthView"></table>');

            var head = $('<thead></thead>');
            grid.append(head);

            var body = $('<tbody></tbody>');
            grid.append(body);

            _this._createHeaderRow(head);
            _this._createMonthViewRows(body);

            _this._bodyEl.append(grid);
        },

        _createHeaderRow: function (head) {
            var _this = this;

            var row = $('<tr></tr>');

            var i,
                k = _this._startDayOfWeek,
                cell,
                text;
            for (i = 0; i < 7; ++i) {
                cell = $('<th></th>');
                cell.text(ns.Locale.weekNames[k % 7]);

                row.append(cell);
                ++k;
            }

            head.append(row);
        },

        _createMonthViewRows: function (body) {
            var _this = this;

            var maxDays = _this._daysInMonth(_this._currentYear, _this._currentMonth),
                firstWeekDay = (_this._firstWeekDayOfMonth(_this._currentYear, _this._currentMonth) - _this._startDayOfWeek) % 7;

            if (firstWeekDay < 0)
                firstWeekDay += 7;

            var rowCount = Math.ceil((maxDays + firstWeekDay) / 7);


            var i, j, k = 0;
            var row, cell, day;

            for (i = 0; i < rowCount; ++i) {
                row = $('<tr></tr>');

                for (j = 0; j < 7; ++j) {
                    cell = $('<td></td>');

                    if (k >= firstWeekDay && k < (maxDays + firstWeekDay)) {
                        day = (k - firstWeekDay + 1);
                        cell.text(day.toString());

                        if (day === _this._selectedDate.getDate()
                            && _this._currentMonth === _this._selectedDate.getMonth()
                            && _this._currentYear === _this._selectedDate.getFullYear()) {

                            cell.addClass('PlatformUI-Selected');
                        }

                        cell.click(
                            function (_cell, _day) {
                                return function () { _this._date_Click(_cell, _day); };
                            } (cell, day)
                        );
                    }
                    else {
                        cell.addClass('PlatformUI-Inactive');
                    }

                    row.append(cell);
                    ++k;
                }

                body.append(row);
            }
        },

        _monthDdl_Change: function () {
            var _this = this;

            _this._currentMonth = _this._monthDdl.prop('selectedIndex');
            _this._recreateMonthView();
        },

        _prevYearButton_Click: function () {
            var _this = this;

            if (_this._currentYear === 1900)
                return;

            --_this._currentYear;
            _this._updateYearLabel();
            _this._recreateMonthView();
        },

        _nextYearButton_Click: function () {
            var _this = this;

            if (_this._currentYear === 2100)
                return;

            ++_this._currentYear;
            _this._updateYearLabel();
            _this._recreateMonthView();
        },

        _date_Click: function (cell, day) {
            var _this = this;

            var prevSelection = $('.PlatformUI-Selected', _this._bodyEl);
            if (prevSelection)
                prevSelection.removeClass('PlatformUI-Selected');

            cell.addClass('PlatformUI-Selected');
            _this._selectedDate = new Date(_this._currentYear, _this._currentMonth, day);

            _this._fireOnSelectedDateChanged();
        },

        _fireOnSelectedDateChanged: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.selectedDateChanged.length; ++i)
                _this._events.selectedDateChanged[i]();
        },

        onSelectedDateChanged: function (handler) {
            var _this = this;

            _this._events.selectedDateChanged.push(handler);
        },

        setSelectedDate: function (date) {
            var _this = this;

            var year = date.getFullYear();
            if (year < 1900 || year > 2100)
                return;

            _this._selectedDate = date;
            _this._currentYear = year;
            _this._currentMonth = date.getMonth();

            _this._updateYearLabel();
            _this._updateMonthDdl();
            _this._recreateMonthView();
        },

        getSelectedDate: function () {
            var _this = this;

            return _this._selectedDate;
        },

        getElement: function () {
            var _this = this;

            return _this._element;
        }
    };

} (PlatformUI));