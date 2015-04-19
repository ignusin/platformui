(function (ns) {
    
    ns.FlatTreeGrid = function (element) {
        ns.FlatTreeGrid.super.constructor.call(this, element);
        
        this.addDataColumn('_upIcon');
        
        this._idColumn = null;
        this._hierarchyColumn = null;
        this._hierarchyDataSource = null;
        this._parentId = 0;
        this._rootText = 'Корневой элемент';
    };
    
    ns.inherit(ns.Grid, ns.FlatTreeGrid, {
        _getCssClass: function () {
            return 'PlatformUI-FlatTreeGrid';
        },
        
        _createBodyRow: function (rowElement, row, isHierarchy) {
            var i,
                columns = this._getColumns(),
                cellElement,
                column,
                eventArgs;

            for (i = 0; i < columns.length; ++i) {
                column = columns[i];
                cellElement = $('<td></td>');

                eventArgs = new ns.GridCellCreatedEventArgs(
                    this, rowElement, cellElement, column, row);
                this._fireBodyCellCreated(eventArgs);

                if (!eventArgs.isDefaultPrevented())
                    this._createBodyCell(rowElement, cellElement, row, column, isHierarchy);

                rowElement.append(cellElement);
            }
        },

        _createBodyCell: function (rowElement, cellElement, row, column, isHierarchy) {
            if (typeof column.horizontal !== 'undefined')
                cellElement.css('text-align', column.horizontal);


            if (ns.GridHelper.isDataColumn(column)) {
                if (column.dataColumn.name === this._hierarchyColumn) {
                    var _this = this;
                    var link = $('<a href="javascript:void(0)">' + ns.value(row, column.dataColumn.name) + '</a>');
                    link.click(function () {
                        _this._parentId = ns.value(row, _this._idColumn);
                        _this.dataBind();
                    });
                    cellElement.append(link);
                }
                else if (isHierarchy && column.dataColumn.name === '_upIcon') {
                    cellElement.addClass('UpIcon');
                }
                else {
                    cellElement.append(ns.value(row, column.dataColumn.name));
                }
            }

            else if (!isHierarchy && ns.GridHelper.isCommandColumn(column)) {
                var eventArgs = new ns.GridCommandEventArgs(
                    this, rowElement, cellElement, column, row);

                var commandLink = $('<a href="javascript:void(0)"></a>');
                commandLink.append(column.commandColumn.title);

                var button = new ns.Button(commandLink);
                button.onClick(function () {
                    column.commandColumn.handler(eventArgs);
                });

                cellElement.append(commandLink);
            }
        },
        
        _createDataRows: function (data, isHierarchy) {
            if (!data) {
                return;
            }
            
            var i,
                dataItem,
                rowElement,
                eventArgs;
            for (i = 0; i < data.length; ++i) {
                dataItem = data[i];
                rowElement = $(isHierarchy ? '<tr class="HierarchyRow"></tr>' : '<tr></tr>');

                eventArgs = new ns.GridRowCreatedEventArgs(this, rowElement, dataItem);
                this._fireBodyRowCreated(eventArgs);

                if (!eventArgs.isDefaultPrevented())
                    this._createBodyRow(rowElement, dataItem, isHierarchy);

                this._bodyElement.append(rowElement);
            }
        },
        
        _dataSource_OnRead: function (hierarchyData, data) {
            this._clearBody();
            this._createDataRows(hierarchyData, true);
            this._appendData(data);
        },
        
        dataBind: function (parentId) {
            var _this = this;
            
            if (parentId !== null && parentId !== undefined) {
                this._parentId = parentId;
            }
            
            this._fireDataBinding();
            
            this._hierarchyDataSource.read(
                function (hierarchyResp) {
                    // Hierarchy items.
                    var rootItem = {};
                    ns.setValue(rootItem, _this._idColumn, 0);
                    ns.setValue(rootItem, _this._hierarchyColumn, _this._rootText);
                    
                    var hierarchyData = [ rootItem ];
                    var i;
                    for (i = 0; i < hierarchyResp.data.length; ++i) {
                        hierarchyData.push(hierarchyResp.data[i]);
                    }                    
                    
                    // Level items.
                    var pagingArgs = _this._pagingEnabled ? _this._pagingArgs : null;
                    var sortingArgs = _this._sortingEnabled && _this._sortingArgs.column ? _this._sortingArgs : null;
                    var filteringArgs = _this._filteringEnabled ? _this._filteringArgs : null;

                    _this._dataSource.read(
                        function (data) { _this._dataSource_OnRead(hierarchyData, data); },
                        pagingArgs,
                        sortingArgs,
                        filteringArgs,
                        { parentId: _this._parentId }
                    );
                },
                null,
                null,
                null,
                { parentId: this._parentId }
            );
        },

        setIdColumn: function (columnName) {
            this._idColumn = columnName;
        },
        
        getIdColumn: function () {
            return this._idColumn;
        },
        
        setHierarchyColumn: function (columnName) {
            this._hierarchyColumn = columnName;
        },
        
        getHierarchyColumn: function () {
            return this._hierarchyColumn;
        },
        
        setHierarchyDataSource: function (hierarchyDataSource) {
            this._hierarchyDataSource = hierarchyDataSource;
        },
        
        getHierarchyDataSource: function () {
            return this._hierarchyDataSource;
        },
        
        setRootText: function (text) {
            this._rootText = text;
        },
        
        getRootText: function () {
            return this._rootText;
        },
        
        getParentId: function () {
            return this._parentId;
        }
    });
    
} (PlatformUI));
