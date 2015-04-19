(function (ns) {

    ns.Dialog = function (content) {
        if (content)
            this._content = $(ns.element(content));
        else
            this._content = $('<div></div>');

        this._wrapper = null;
        this._dialog = null;
        this._title = null;
        this._container = null;
        this._commandPanel = null;
        
        this._width = 300;
        this._height = 100;
        this._maximized = false;
        
        this._init();
    };

    ns.extend(ns.Dialog, {
        _init: function () {        
            var _this = this;

            // Background.
            var bg = $('<div class="Background"></div>');

            // Dialog.
            var dialog = $('<div class="Dialog"></div>');

            var title = $('<h1 class="DialogTitle"></h1>');
            dialog.append(title);

            var container = $('<div class="Container"></div>');
            container.append(this._content);
            dialog.append(container);

            var commandPanel = $('<div class="CommandPanel"></div>');
            commandPanel.hide();
            dialog.append(commandPanel);

            // Wrapper.
            var wrapper = $('<div class="PlatformUI-Control PlatformUI-Dialog"></div>');
            wrapper.hide();
            wrapper.append(bg);
            wrapper.append(dialog);
            
            $(window).resize(function () {
                _this._onWindowResize();
            });

            // Final initializations.
            $(ns.body()).append(wrapper);
            _this._title = title;
            _this._container = container;
            _this._commandPanel = commandPanel;
            _this._dialog = dialog;
            _this._wrapper = wrapper;
        },

        setContentElement: function (elem) {
            var _this = this;

            _this._container.empty();
            _this._container.append(ns.element(elem));
        },

        getContentElement: function () {
            var _this = this;
            return _this._content;
        },

        setTitle: function (title) {
            var _this = this;
            _this._title.text(title);
        },

        getTitle: function () {
            var _this = this;
            return _this._title.text();
        },
        
        setSize: function (width, height) {
            this._width = width;
            this._height = height;
            this._resizeIfVisible();
        },
        
        getWidth: function () {
            return this._width;
        },
        
        getHeight: function () {
            return this._height;
        },
        
        setContentSize: function (width, height) {
            this._width = width;
            this._height = height + this._title.height() + this._commandPanel.height();
            this._maximized = false;
            this._resizeIfVisible();
        },
        
        getContentWidth: function () {
            return this._width;
        },
        
        getContentHeight: function () {
            return this._height - this._title.height() - this._commandPanel.height();
        },

        addCommandElement: function (elem) {
            var _this = this;

            _this._commandPanel.append(ns.element(elem));
            _this._commandPanel.show();
        },
        
        _resizeIfVisible: function () {
            if (!this._wrapper.is(':visible')) {
                return;
            }
            
            this._resize();
        },

        _resize: function () {
            var _this = this;
            
            var dialog = _this._dialog;
            
            dialog.width(_this._width);
            dialog.height(_this._height);

            var width = dialog.width();
            var height = dialog.height();

            var marginTop = 1.5 * height;
            if ($(window).innerHeight() / 2 - marginTop < 150) {
                marginTop = $(window).innerHeight() / 2 - 150;
            }

            if ($(window).innerHeight() / 2 < height) {
                marginTop = height / 2;
            }

            dialog.css({
                'margin-left': -Math.round(width / 2),
                'margin-top': -Math.round(marginTop)
            });
        },
        
        _onWindowResize: function () {
            if (this._maximized) {
                this.maximize();
            }
        },
        
        maximize: function () {
            this._maximized = true;
            
            this._width = $(window).innerWidth() - 50;
            this._height = $(window).innerHeight() - 50;
            
            this._resizeIfVisible();
        },

        setScrollingEnabled: function (enabled) {
            if (enabled) {
                this._container.addClass('Scrollable');
            }
            else {
                this._container.removeClass('Scrollable');
            }
        },

        show: function () {
            var _this = this;

            _this._wrapper.css('z-index', ns.nextZIndex());

            ns.appear(_this._wrapper, {
                start: function () {
                    _this._resize();
                }
            });
        },

        hide: function () {
            var _this = this;

            ns.disappear(_this._wrapper);
        }
    });
    
} (PlatformUI));