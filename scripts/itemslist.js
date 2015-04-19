(function (ns) {

    ns.ItemsList = function (containerEl) {

        if (containerEl)
            this._containerEl = $(ns.element(containerEl));
        else
            this._containerEl = $('<div></div>');

        this._selectedIndex = -1,
        this._items = [],
        this._events = {
            selectedIndexChanged: []
        };


        this._initControl();
    };

    ns.ItemsList.prototype = {
        _initControl: function () {
            var _this = this;

            _this._containerEl.addClass('ns-ItemsList');
        },

        _fireOnSelectedIndexChanged: function () {
            var _this = this;

            var i;
            for (i = 0; i < _this._events.selectedIndexChanged.length; ++i)
                _this._events.selectedIndexChanged[i]();
        },

        setSelectedIndex: function (index) {
            var _this = this;

            if (_this._selectedIndex !== -1) {
                _this._items[_this._selectedIndex].container.removeClass('Selected');
            }

            _this._selectedIndex = index;

            if (index !== -1) {
                var container = _this._items[index].container;
                container.addClass('Selected');

                _this._containerEl[0].scrollIntoView(true);
            }
        },

        getSelectedIndex: function() {
            var _this = this;

            return _this._selectedIndex;
        },

        addItem: function (item) {
            var _this = this;

            var container = $('<a href="javascript:void(0)" class="Item"></a>');
            container.append(item);

            var index = _this._items.length;
            container.mouseover(function() {
                container.addClass('Highlighted');
            });

            container.mouseout(function () {
                container.removeClass('Highlighted');

                if (_this._selectedIndex === index)
                    container.addClass('Selected');
            });

            container.click(function () {
                if (_this._selectedIndex !== -1)
                    _this._items[_this._selectedIndex].container.removeClass('Selected');

                _this._selectedIndex = index;
                _this._items[_this._selectedIndex].container.addClass('Selected');

                _this._fireOnSelectedIndexChanged();
            });


            _this._items.push({ container: container, item: item });
            _this._containerEl.append(container);
        },

        removeItemAt: function (index) {
            var _this = this;

            var container = _this._items[index].container;
            container.remove();

            _this._items.splice(index, 1);

            if (index === _this._selectedIndex) {
                _this._selectedIndex = -1;
                _this._fireOnSelectedIndexChanged();
            }
        },

        clear: function () {
            var _this = this;

            _this._containerEl.empty();
            _this._items = [];
            _this._selectedIndex = -1;
        },

        getItemAt: function (index) {
            var _this = this;

            return _this._items[index].item;
        },

        onSelectedIndexChanged: function (handler) {
            var _this = this;

            _this._events.selectedIndexChanged.push(handler);
        },

        getItemElementAt: function (index) {
            var _this = this;

            return _this._containerEl.children()[index];
        },

        getElement: function () {
            var _this = this;

            return _this._containerEl;
        }
    };


    ns.DropDownItemsList = function (el) {

        if (el)
            this._el = $(ns.element(el));
        else
            this._el = $('<div></div>');

        this._dropDown = null;
        this._itemsList = null;
        this._selectedIndex = -1;

        this._displayItems = [];


        this._initControl();
    };

    ns.DropDownItemsList.prototype = {

        _initControl: function () {
            var _this = this;

            var itemsListEl = $('<div style="max-height: 200px; overflow-y: auto; overflow-x: hidden"></div>');

            _this._itemsList = new ns.ItemsList(itemsListEl);
            _this._dropDown = new ns.DropDown(_this._el, _this._itemsList.getElement());

            _this._itemsList.onSelectedIndexChanged(function () {
                var index = _this._itemsList.getSelectedIndex();
                _this._selectedIndex = index;

                if (index !== -1)
                    _this._dropDown.setTextElement(_this._displayItems[index]);
                else
                    _this._dropDown.setText('');

                _this._dropDown.hide();
            });

            _this._dropDown.onBeforeShow(function () {
                _this._itemsList.setSelectedIndex(_this._selectedIndex);
            });

            _this._dropDown.onAfterShow(function () {
                if (_this._selectedIndex !== -1) {
                    itemsListEl.scrollTop = _this._itemsList.getItemElementAt(_this._selectedIndex).offsetTop;
                }
            });
        },

        addItem: function (item, displayItem) {
            var _this = this;

            if (!displayItem)
                _this._displayItems.push(item.cloneNode(true));
            else
                _this._displayItems.push(displayItem);

            _this._itemsList.addItem(item);
        },

        removeItemAt: function (index) {
            var _this = this;

            _this._displayItems.splice(index, 1);
            _this._itemsList.removeItemAt(index);
        },

        onSelectedIndexChanged: function (handler) {
            var _this = this;

            _this._itemsList.onSelectedIndexChanged(handler);
        },

        getSelectedIndex: function() {
            var _this = this;

            return _this._selectedIndex;
        },

        setSelectedIndex: function(index) {
            var _this = this;

            _this._selectedIndex = index;

            if (index !== -1)
                _this._dropDown.setTextElement(_this._displayItems[index]);
            else
                _this._dropDown.setText('');
        },

        setText: function (text) {
            var _this = this;

            _this._dropDown.setText(text);
        },

        setTextElement: function (textElement) {
            var _this = this;

            _this._dropDown.setTextElement(textElement);
        },

        setEnabled: function (enabled) {
            var _this = this;

            _this._dropDown.setEnabled(enabled);
        },

        isEnabled: function () {
            var _this = this;

            return _this._dropDown.isEnabled();
        },

        show: function() {
            var _this = this;

            _this._dropDown.show();
        },

        hide: function() {
            var _this = this;

            _this._dropDown.hide();
        },

        getElement: function() {
            var _this = this;

            return _this._el;
        }
    };
    
} (PlatformUI));