(function (ns) {

    ns.SpringContainer = function (container) {
        if (container)
            this._container = $(ns.element(container));
        else
            this._container = $('<div></div>');

        this._panels = [];
        this._activeIndex = -1;

        this._init();
    };

    PlatformUI.extend(ns.SpringContainer, {
        _init: function () {
            var _this = this;

            _this._container.addClass('PlatformUI-Control PlatformUI-SpringContainer');

            _this._container.empty();
        },

        addPanel: function (panelOptions) {
            var _this = this;

            if (!panelOptions.element) {
                throw 'No element specified for panelOptions';
            }

            var index = _this._panels.length;

            var contEl = $('<div class="Child"></div>')

            var titleEl = $('<h1 class="Title">' + panelOptions.title + '</h1>');
            titleEl.mousedown((function (index) {
                return function () {
                    _this._onPanelMouseDown(index);
                };
            }(index)));
            contEl.append(titleEl);

            var bodyEl = $('<div class="Body"></div>');
            var el = ns.element(panelOptions.element);
            bodyEl.append(el);

            contEl.append(bodyEl);

            var disableEl = $('<div class="Disabled" style="display: none"></div>');
            contEl.append(disableEl);

            _this._panels.push({
                title: panelOptions.title,
                contEl: contEl,
                disableEl: disableEl,
                el: el
            });

            _this._container.append(contEl);
            _this.relayout(false);
        },

        _onPanelMouseDown: function (index) {
            var _this = this;
            _this.setActivePanel(index);
        },

        _relayoutNoSelection: function (animate) {
            var _this = this;
            var i;

            var n = _this._panels.length;
            var childWidth = Math.floor(100 / n);
            var p, css;

            for (i = 0; i < n; ++i) {
                p = _this._panels[i];

                css = {
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: (i * childWidth).toString() + '%',
                };

                if (i === n - 1) {
                    css.right = '0';
                }
                else {
                    css.width = childWidth.toString() + '%';
                }

                if (!animate) {
                    p.contEl.css(css);
                }
                else {
                    p.contEl.animate(css, 200);
                }
            }
        },

        _relayoutSelected: function (animate) {
            var _this = this;
            var i;

            var n = _this._panels.length;
            var ai = _this._activeIndex;

            var contWidth = _this._container.innerWidth();
            var activeWidth = Math.floor(contWidth * 0.8);
            var nonActiveWidth = Math.floor((contWidth - activeWidth) / (n - 1));

            var p, css;
            var left = 0;

            for (i = 0; i < n; ++i) {
                p = _this._panels[i];

                css = {
                    top: 0,
                    bottom: 0,
                    left: left.toString() + 'px'
                };

                if (i === ai) {
                    if (ai === (n - 1)) {
                        css.rigth = 0;
                    }
                    else {
                        css.width = activeWidth;
                        left += activeWidth;
                    }

                    p.disableEl.fadeOut();
                }
                else {
                    if (i === (n - 1)) {
                        css.right = 0;
                    }
                    else {
                        css.width = nonActiveWidth;
                        left += nonActiveWidth;
                    }

                    p.disableEl.fadeIn();
                }

                if (!animate) {
                    p.contEl.css(css);
                }
                else {
                    p.contEl.animate(css, 200);
                }
            }
        },

        relayout: function (animate) {
            var _this = this;
            if (_this._activeIndex === -1 || _this._panels.length === 1) {
                _this._relayoutNoSelection(animate);
            }
            else {
                _this._relayoutSelected(animate);
            }
        },

        setActivePanel: function (index) {
            var _this = this;

            if (_this._activeIndex > -1) {
                _this._panels[_this._activeIndex].contEl.removeClass('Selected');
            }

            if (index > -1) {
                _this._panels[index].contEl.addClass('Selected');
            }

            _this._activeIndex = index;
            _this.relayout(true);
        },

        getElement: function () {
            return this._container;
        }
    });

}(PlatformUI));