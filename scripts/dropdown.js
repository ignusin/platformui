(function (ns) {
    
    ns.DropDown = function (el, dropEl) {

        if (el)
            this._el = $(ns.element(el));
        else
            this._el = $('<div></div>');

        this._buttonEl = null;
        this._buttonTextEl = null;
        this._dropContainerEl = null;

        if (dropEl)
            this._dropEl = $(ns.element(dropEl));
        else
            this._dropEl = null;

        this._isShown = null;
        this._isCancelled = null;
        this._isEnabled = null;

        this._events = {
            beforeShow: [],
            afterShow: [],
            beforeHide: [],
            afterHide: []
        };


        this._initControl();
    };


    ns.DropDown.prototype = {

        _initControl: function () {
            var _this = this;

            _this._isEnabled = true;

            _this._buttonEl = $('<a href="javascript:void(0)" class="ns-DropDown-Button"></a>');
            _this._el.append(_this._buttonEl);

            _this._dropContainerEl = $('<div class="ns-DropDown-Popup" style="display:none"></div>');

            if (_this._dropEl)
                _this._dropContainerEl.append(_this._dropEl);

                    $(ns.body()).append(_this._dropContainerEl);

            _this._dropContainerEl.mousedown(function (e) { _this._dropContainer_MouseDown(e); });
            _this._buttonEl.mousedown(function (e) { _this._button_MouseDown(e); });
            ns.body().addEventListener('mousedown', function (e) { _this._body_MouseDown(e); }, true);
        },

        _button_MouseDown: function () {
            var _this = this;

            if (!_this._isShown) {
                if (_this._isEnabled) _this._show();
            }
            else {
                _this._hide();
                _this._isCancelled = false;
            }
        },

        _dropContainer_MouseDown: function () {
            var _this = this;

            if (_this._isShown)
                _this._isCancelled = true;
        },

        _body_MouseDown: function () {
            var _this = this;

            if (!_this._isShown)
                return;

            window.setTimeout(function () {
                if (_this._isCancelled) {
                    _this._isCancelled = false;
                    return;
                }

                _this._hide();
            }, 50);
        },

        _fireOnBeforeShow: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.beforeShow.length; ++i)
                _this._events.beforeShow[i]();
        },

        _fireOnAfterShow: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.afterShow.length; ++i)
                _this._events.afterShow[i]();
        },

        _fireOnBeforeHide: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.beforeHide.length; ++i)
                _this._events.beforeHide[i]();
        },

        _fireOnAfterHide: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.afterHide.length; ++i)
                _this._events.afterHide[i]();
        },

        _show: function () {
            var _this = this;

            _this._fireOnBeforeShow();

            var elOffset = _this._el.offset(),
                x = Math.round(elOffset.left),
                y = _this._el.outerHeight() + Math.round(elOffset.top);

            _this._dropContainerEl.css({
                'z-index': ns.nextZIndex(),
                'left': x,
                'top': y,
                'position': 'absolute'
            });

            ns.appear(_this._dropContainerEl);

            _this._isShown = true;
            _this._isCancelled = false;

            _this._buttonEl.addClass('Selected');
            _this._fireOnAfterShow();
        },

        _hide: function () {
            var _this = this;

            _this._fireOnBeforeHide();

            _this._buttonEl.removeClass('Selected');
            ns.disappear(_this._dropContainerEl);
            _this._isShown = false;

            _this._fireOnAfterHide();
        },

        _setEnabled: function (enabled) {
            var _this = this;

            _this._isEnabled = enabled;

            if (!_this._isEnabled)
                _this._buttonEl.addClass('Disabled');
            else
                _this._buttonEl.removeClass('Disabled');
        },

        setEnabled: function (enabled) {
            var _this = this;

            _this._setEnabled(enabled);
        },

        isEnabled: function () {
            var _this = this;

            return _this._isEnabled;
        },

        hide: function () {
            var _this = this;

            _this._hide();
        },

        setText: function (value) {
            var _this = this;

            _this._buttonEl.empty();
            _this._buttonEl.text(value);
        },

        setTextElement: function (textElement) {
            var _this = this;

            _this._buttonEl.empty();
            _this._buttonEl.append(textElement);
        },

        setDropDownElement: function (dropEl) {
            var _this = this;

            _this._dropEl = dropEl;

            _this._dropContainerEl.empty();
            _this._dropContainerEl.append(dropEl);
        },

        getDropDownElement: function () {
            var _this = this;

            return _this._dropEl;
        },

        onBeforeShow: function (handler) {
            var _this = this;

            _this._events.beforeShow.push(handler);
        },

        onAfterShow: function (handler) {
            var _this = this;

            _this._events.afterShow.push(handler);
        },

        onBeforeHide: function (handler) {
            var _this = this;

            _this._events.beforeHide.push(handler);
        },

        onAfterHide: function (handler) {
            var _this = this;

            _this._events.afterHide.push(handler);
        },

        getElement: function () {
            var _this = this;

            return _this._el;
        }
    };

} (PlatformUI));