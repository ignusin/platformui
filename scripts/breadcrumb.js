(function (ns) {
    
    ns.Breadcrumb = function (element) {
        this._element = $(element ? PlatformUI.element(element) : '<div></div>');
        
        this._dataSource = null;
        this._rootText = '';
        this._displayField = 'name';
        this._selectedIndex = -1;
        this._events = {
            select: []
        };
        
        this._init();
    };
    
    ns.extend(ns.Breadcrumb, {
        _init: function () {
            this._element.addClass('PlatformUI-Control PlatformUI-Breadcrumb');
        },
        
        setRootText: function (rootText) {
            this._rootText = rootText;
        },
        
        getRootText: function () {
            return this._rootText;
        },
        
        setDataSource: function (dataSource) {
            this._dataSource = dataSource;
        },
        
        getDataSource: function () {
            return _dataSource;
        },
        
        setDisplayField: function (displayField) {
            this._displayField = displayField;
        },
        
        getDisplayField: function () {
            return this._displayField;
        },
        
        dataBind: function () {
            var _this = this;
            this._dataSource.read(function (result) {
                _this._element.empty();
                
                _this._createRootElement();
                
                var i;
                for (i = 0; i < result.data.length; ++i) {
                    _this._createItemElement(result.data[i], i);
                }
                
                _this._select(result.data.length - 1);
            });
        },
        
        _select: function (index) {
            var prevSelected = this._element.children().eq(this._selectedIndex + 1);
            prevSelected.removeClass('Selected');
            
            this._selectedIndex = index;
            var curSelected = this._element.children().eq(this._selectedIndex + 1);
            curSelected.addClass('Selected');
        },
        
        _createRootElement: function () {
            var _this = this;
            
            var rootEl = $('<span class="Root"></span>');
            
            var linkEl = $('<a href="javascript:void(0)"></a>');
            linkEl.html(this._rootText);
            linkEl.click(function () {
                _this._select(-1);
                _this._onItemClick(null);
            });
            
            rootEl.append(linkEl);
            
            this._element.append(rootEl);
        },
        
        _createItemElement: function (item, index) {
            var _this = this;
            
            var nextEl = $('<span class="Next"></span>');
            
            var linkEl = $('<a href="javascript:void(0)"></a>');
            linkEl.html(ns.value(item, this._displayField));
            linkEl.click(function () {
                _this._select(index);
                _this._onItemClick(item);
            });
                        
            var itemEl = $('<span></span>');
            itemEl.addClass('Item' + (index % 2 === 1 ? ' Alt' : ''));
            itemEl.append(nextEl);
            itemEl.append(linkEl);
            
            this._element.append(itemEl);
        },
        
        _onItemClick: function (item) {
            this._fireOnSelect(item);
        },
        
        onSelect: function (handler) {
            this._events.select.push(handler);
        },
        
        _fireOnSelect: function (item) {
            var i;
            for (i = 0; i < this._events.select.length; ++i) {
                this._events.select[i](item);
            }
        }
    });
    
} (PlatformUI.ns('PlatformUI')));

