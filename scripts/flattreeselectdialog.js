(function (ns) {
    
    ns.FlatTreeSelectDialog = function (config) {
        this._config = config;
        this._dialog = null;
        this._grid = null;
        
        this._events = {
            select: []
        };
        
        this._selectedHierarchy = null;
        
        this._init();
    };
    
    PlatformUI.extend(ns.FlatTreeSelectDialog, {
        _init: function () {
            this._initGrid();
            this._initDialog();
        },
        
        _initGrid: function () {
            var _this = this;
            
            var grid = new PlatformUI.FlatTreeGrid();
            
            var ds = new PlatformUI.RemoteDataSource(this._config.itemUrl);
            
            var hierarchyDS = new PlatformUI.RemoteDataSource(this._config.hierarchyUrl);
            hierarchyDS.onPrepareResponse(function (resp) { _this._onPrepareHierarchyResponse(resp); });

            grid.setDataSource(ds);
            grid.setHierarchyDataSource(hierarchyDS);
            this._createGridColumns(grid);
            grid.setIdColumn(this._config.idField);
            grid.setHierarchyColumn(this._config.displayField);
            grid.setSortingEnabled(true);
            grid.setDefaultSorting(this._config.displayField, PlatformUI.SortDirection.Ascending);
            grid.setEmptyDataText('Элементы не найдены.');
            grid.setPagingEnabled(true);
            grid.setPageSize(8);
            
            this._grid = grid;
        },
        
        _initDialog: function () {
            var _this = this;
            
            var selectButton = new PlatformUI.Button();
            selectButton.setText('Выбрать');
            selectButton.onClick(function () {
                _this._onSelect();
            });
            
            var closeButton = new PlatformUI.Button();
            closeButton.setText('Закрыть');
            closeButton.onClick(function () {
                _this.hide();
            });
            
            var content = $('<div style="width: 600px; height: 330px; overflow: auto;"></div>');
            var pager = $('<div></div>');
            content.append(pager);
            
            var gridContent = $('<div style="width: 600px; height: 300px; overflow: auto;"></div>');
            gridContent.append(this._grid.getElement());
            content.append(gridContent);
            
            var pager = new PlatformUI.Pager(this._grid, pager);
            
            var dialog = new PlatformUI.Dialog();
            dialog.setTitle(this._config.title);
            dialog.setContentElement(content);
            dialog.addCommandElement(selectButton);
            dialog.addCommandElement(closeButton);
            dialog.setContentSize(610, 340);
            
            this._dialog = dialog;
        },
        
        _createGridColumns: function (grid) {
            grid.addColumns([
                { dataColumn: { name: this._config.displayField, sortable: true }, header: this._config.displayFieldHeader, width: '560px' }
            ]);            
        },
        
        _onPrepareHierarchyResponse: function (resp) {
            this._selectedHierarchy = resp.data.data;
        },
        
        _fireOnSelect: function () {
            var i;
            for (i = 0; i < this._events.select.length; ++i) {
                this._events.select[i]();
            }
        },
        
        onSelect: function (handler) {
            this._events.select.push(handler);
        },
        
        _onSelect: function () {
            this._fireOnSelect();
            this.hide();
        },
        
        getSelectedHierarchy: function () {
            return this._selectedHierarchy;
        },
                
        show: function (parentId) {
            this._selectedItem = null;
            this._grid.dataBind(parentId);
            this._dialog.show();
        },
        
        hide: function () {
            this._dialog.hide();
        }
    });
    
} (PlatformUI.ns('PlatformUI')));