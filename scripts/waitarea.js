(function (ns) {

    /**
      * @class PlatformUI.WaitArea
      */
    /**
      * @constructor PlatformUI.WaitArea
      */
    ns.WaitArea = function () {
        this._el = $(ns.body());
        this._backgroundEl = null;
        this._waitEl = null;
        this._toShow = false;

        this._init();
    };

    ns.WaitArea.prototype = {
        _init: function () {
            var _this = this;

            var backgroundEl = $('<div></div>');
            backgroundEl.addClass('PlatformUI-WaitArea-Background');
            backgroundEl.css({ display: 'none' });

            var waitEl = $('<div></div>');
            waitEl.addClass('PlatformUI-Control');
            waitEl.addClass('PlatformUI-WaitArea');
            waitEl.text('Ожидайте, выполняется запрос');
            waitEl.css({ display: 'none' });

            var body = $(ns.body());
            body.append(backgroundEl);
            body.append(waitEl);

            _this._backgroundEl = backgroundEl;
            _this._waitEl = waitEl;
        },

        _show: function () {
            var _this = this;

            if (!_this._toShow) {
                return;
            }

            _this._backgroundEl.css({
                'z-index': ns.nextZIndex()
            });

            _this._backgroundEl.css({
                'position': 'fixed',
                'left': '0',
                'top': '0',
                'right': '0',
                'bottom': '0',
                'margin-left': '0',
                'margin-top': '0',
                'margin-right': '0',
                'margin-bottom': '0',
                //'display': 'block',
                'width': '100%',
                'height': '100%'
            });

            _this._waitEl.css({
                'z-index': ns.nextZIndex(),
                //'display': 'block',
                'position': 'fixed',
                'left': '50%',
                'top': '50%',
                'right': 'auto',
                'bottom': 'auto'
            });

            ns.appear(_this._backgroundEl);

            ns.appear(_this._waitEl, {
                start: function () {
                    _this._waitEl.css({
                        'margin-left': (((-_this._waitEl.width())) / 2) + 'px',
                        'margin-top': (((-_this._waitEl.height())) / 2) + 'px',
                        'margin-right': '0',
                        'margin-bottom': '0'
                    });
                }
            });
        },

        /**
          * @method PlatformUI.WaitArea.show
          */	
        show: function () {
            var _this = this;

            _this._toShow = true;
            _this._show();
        },

        /**
          * @method PlatformUI.WaitArea.hide
          */	
        hide: function () {
            var _this = this;

            //_this._backgroundEl.css({ display: 'none'});
            //_this._waitEl.css({ display: 'none'});

            ns.disappear(_this._waitEl);
            ns.disappear(_this._backgroundEl);

            _this._toShow = false;
        },
        
        toDataBoundControl: function (control) {
            var _this = this;
            
            control.onDataBinding(function () {
                _this.show();
            });
            
            control.onDataBound(function () {
                _this.hide();
            });
        }
    };

} (PlatformUI));