(function (ns) {

    ns.TabContainer = function (tabContainerEl) {
        if (tabContainerEl)
            this._tabContainerEl = $(ns.element(tabContainerEl));
        else
            this._tabContainerEl = $('<div></div>');

        this._tabStripEl = null;
        this._tabBodyEl = null;
        this._tabs = [];
        this._selectedIndex = -1;

        this._events = {
            tabSelected: []
        };


        this._initControl();
    };

    ns.TabContainer.prototype = {

        _initControl: function () {
            var _this = this;
            _this._tabContainerEl.addClass('ns-Control ns-TabContainer');

            _this._initTabStrip();
            _this._initTabBody();
        },

        _initTabStrip: function () {
            var _this = this;

            var tabStripEl = $('<ul></ul>');
            tabStripEl.addClass('ns-TabStrip');

            _this._tabContainerEl.append(tabStripEl);
            _this._tabStripEl = tabStripEl;
        },

        _createTabStripItem: function (text, index) {
            var _this = this;

            var itemEl = $('<li></li>');

            var itemLink = $('<a href="javascript:void(0)"></a>');
            itemLink.click(function () {
                _this._tabStripItem_Click(index);
            });

            itemLink.text(text);
            itemEl.append(itemLink);

            return itemEl;
        },

        _initTabBody: function () {
            var _this = this;

            var tabBodyEl = $('<div></div>');
            tabBodyEl.addClass('ns-TabBody');

            _this._tabContainerEl.append(tabBodyEl);
            _this._tabBodyEl = tabBodyEl;
        },

        _createTabBodyItem: function (el) {
            var itemEl = $('<div style="display:none"></div>');
            itemEl.append(el);

            return itemEl;
        },

        _selectTab: function (index) {
            var _this = this;

            if (_this._selectedIndex !== -1) {
                _this._tabs[_this._selectedIndex].tabStripItem.removeClass('ns-Selected');
                _this._tabs[_this._selectedIndex].tabBodyItem.hide();
            }

            _this._selectedIndex = index;
            _this._tabs[_this._selectedIndex].tabStripItem.addClass('ns-Selected');
            _this._tabs[_this._selectedIndex].tabBodyItem.show();
        },

        _tabStripItem_Click: function (index) {
            var _this = this;

            _this._selectTab(index);
            _this._fireOnTabSelected(index);
        },

        _fireOnTabSelected: function (index) {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.tabSelected.length; ++i)
                _this._events.tabSelected[i](index);
        },

        addTab: function (text, tabEl) {
            var _this = this;

            var tabCount = _this._tabs.length;

            var tabStripItem = _this._createTabStripItem(text, _this._tabs.length);
            var tabBodyItem = _this._createTabBodyItem(ns.element(tabEl));

            _this._tabStripEl.append(tabStripItem);
            _this._tabBodyEl.append(tabBodyItem);

            _this._tabs.push({ tabStripItem: tabStripItem, tabBodyItem: tabBodyItem });

            if (tabCount === 0) {
                _this.selectTab(0);
            }
        },

        removeTabAt: function (index) {
            var _this = this;

            _this._tabs[index].tabStripItem.remove();
            _this._tabs[index].tabBodyItem.remove();
            _this._tabs.splice(index, 1);

            if (_this._selectedIndex === index) {
                if (_this._tabs.length > 0)
                    _this.selectTab(0);
                else
                    _this._selectedIndex = -1;
            }
        },

        selectTab: function (index) {
            var _this = this;
            _this._selectTab(index);
        },

        onTabSelected: function (handler) {
            var _this = this;
            _this._events.tabSelected.push(handler);
        },

        getElement: function () {
            var _this = this;
            return _this._tabContainerEl;
        }
    };

} (PlatformUI));