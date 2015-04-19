(function (ns) {

    ns.Button = function (el) {
        if (el)
            this._el = $(ns.element(el));
        else
            this._el = $('<a href="javascript:void(0)"></a>');

        this._pushed = false;
        this._enabled = true;
        this._pushedExt = false;

        this._events = {
            click: []
        };

        this._initControl();
    };    


    ns.Button.prototype = {

        _initControl: function () {
            var _this = this;

            this._el.addClass('PlatformUI-Control PlatformUI-Button');

            this._el.mousedown(function () {
                if (!_this._enabled || _this._pushedExt)
                    return;

                _this._el.addClass('Pushed');
                _this._pushed = true;
            });

            this._el.mouseup(function () {
                if (!_this._enabled || _this._pushedExt)
                    return;

                _this._el.removeClass('Pushed Over');
                _this._pushed = false;
            });

            this._el.mouseover(function () {
                if (_this._pushed || !_this._enabled || _this._pushedExt)
                    return;

                _this._el.addClass('Over');
            });

            this._el.mouseout(function () {
                if (!_this._enabled || _this._pushedExt)
                    return;

                _this._el.removeClass('Pushed Over');

                if (_this._pushed)
                    _this._pushed = false;
            });

            this._el.click(function () {
                if (!_this._enabled)
                    return;

                _this._fireOnClickEvent();
            });
        },

        _fireOnClickEvent: function () {
            var i;
            for (i = 0; i < this._events.click.length; ++i)
                this._events.click[i](this._el);
        },

        onClick: function (handler) {
            this._events.click.push(handler);
        },

        setEnabled: function (enabled) {
            if (enabled)
                this._el.removeClass('Disabled');
            else
                this._el.addClass('Disabled');

            this._enabled = enabled;
        },

        isEnabled: function () {
            return this._enabled;
        },

        setPushed: function (pushed) {
            this._pushedExt = pushed;
            if (this._pushedExt)
                this._el.addClass('Pushed');
            else
                this._el.removeClass('Pushed');
        },

        isPushed: function () {
            return this._pushedExt;
        },

        setText: function (text) {
            var tagName = this._el.prop('tagName').toUpperCase();

            if (tagName === 'A')
                this._el.text(text);
            else if (tagName === 'INPUT')
                this._el.attr('value', text);
        },

        getText: function () {
            var tagName = this._el.prop('tagName').toUpperCase();

            if (tagName === 'A')
                return this._el.text();
            else if (tagName === 'INPUT')
                return this._el.attr('value');
            else
                return null;
        },

        getElement: function () {
            return this._el;
        }
    };

} (PlatformUI));