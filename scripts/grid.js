(function (ns) {

    ns.GridRowCreatedEventArgs = function (grid, rowElement, dataItem) {
        this._defaultPrevented = false;

        this.sender = grid;
        this.rowElement = rowElement;
        this.dataItem = dataItem;
    };

    ns.GridRowCreatedEventArgs.prototype = {
        preventDefault: function() {
            this._defaultPrevented = true;
        },

        isDefaultPrevented: function() {
            return this._defaultPrevented;
        }
    };



    ns.GridCellCreatedEventArgs = function (
            grid, rowElement, cellElement, column, dataItem) {

        this._defaultPrevented = false;

        this.sender = grid;
        this.rowElement = rowElement;
        this.cellElement = cellElement;
        this.column = column;
        this.dataItem = dataItem;
    };

    ns.GridCellCreatedEventArgs.prototype = {
        preventDefault: function () {
            this._defaultPrevented = true;
        },

        isDefaultPrevented: function () {
            return this._defaultPrevented;
        }
    };



    ns.GridCommandEventArgs = function (
            grid, rowElement, cellElement, column, dataItem) {

        this.sender = grid;
        this.rowElement = rowElement;
        this.cellElement = cellElement;
        this.column = column;
        this.dataItem = dataItem;
    };


    ns.GridHelper = {
        isCommandColumn: function(column) {
            return column.commandColumn !== undefined;
        },

        isDataColumn: function(column) {
            return column.dataColumn !== undefined;
        },

        getColumnName: function(column) {
            if (this.isDataColumn(column))
                return column.dataColumn.name;

            else if (this.isCommandColumn(column))
                return column.commandColumn.name;

            return null;
        }
    };



    ns.Grid = function (element) {
        if (element)
            this._element = $(ns.element(element));
        else
            this._element = $('<table></table>');


        this._items = null;

        this._headerElement = null;
        this._bodyElement = null;
        this._columns = [];
        this._emptyDataText = null;
        this._dataSource = null;
        this._pagingEnabled = false;
        this._sortingEnabled = false;
        this._filteringEnabled = false;

        this._sortingArgs = {
            column: '',
            direction: ns.SortDirection.Ascending
        };
        this._sortingButton = null;
        this._pagingArgs = { index: 1, size: 10 };
        this._filteringArgs = {};

        this._events = {
            pageIndexChanged: new Array(),
            pageSizeChanged: new Array(),
            itemsCountChanged: new Array(),
            bodyRowCreated: new Array(),
            bodyCellCreated: new Array(),
            dataBinding: new Array(),
            dataBound: new Array()
        };

        this._initElements();
    };


    ns.extend(ns.Grid, {
        _initElements: function () {       
            this._recreateHeaderRow();
            this._element.addClass('PlatformUI-Control ' + this._getCssClass());
        },
        
        _getCssClass: function () {
            return 'PlatformUI-Grid';
        },

        _getColumns: function () {
            return this._columns;
        },

        _recreateHeaderRow: function () {
            if (!this._headerElement) {
                this._headerElement = $('<thead></thead>');
                this._element.append(this._headerElement);
            }

            this._headerElement.empty();

            var headerRows = this._createHeaderRows();
            this._headerElement.append(headerRows);
        },

        _createHeaderRows: function () {
            var result = $();

            var i,
                columns = this._getColumns();

            var headerRow = $('<tr></tr>');
            for (i = 0; i < columns.length; ++i) {
                headerRow.append(this._createHeaderCell(columns[i]));
            }
            result = result.add(headerRow);


            if (this._filteringEnabled) {
                var filterRow = $('<tr></tr>');
                filterRow.addClass('PlatformUI-Filter');

                for (i = 0; i < columns.length; ++i) {
                    filterRow.append(this._createHeaderFilterCell(columns[i]));
                }

                result = result.add(filterRow);
            }

            return result;
        },

        _createHeaderCell: function (column) {
            var headerText = '';
            if (column.header)
                headerText = column.header;


            var headerElement;

            if (!this._sortingEnabled || !column.dataColumn || !column.dataColumn.sortable) {
                headerElement = $('<span></span>');
                headerElement.append(headerText);
            }
            else {
                var _this = this;

                var sortButton = $('<a href="javascript:void(0)"><span></span><div class="SortIcon"></div></a>');
                $('span', sortButton).append(headerText);
                sortButton.click(function() {
                    _this._sortButton_OnClick($(this), column.dataColumn);
                });

                headerElement = sortButton;
                column._sortingButton = sortButton;
            }


            var cell = $('<th></th>');

            if (typeof column.width !== 'undefined')
                cell.width(column.width);

            cell.append(headerElement);


            return cell;
        },

        _createHeaderFilterCell: function (column) {
            var cell = $('<th></th>');

            if (typeof column.width !== 'undefined')
                cell.width(column.width);

            if (!column.dataColumn || !column.dataColumn.filterable)
                return cell;


            var _this = this;

            var filterTextBox = $('<input type="text" />');
            filterTextBox.keyup(function () {
                _this._filteringArgs[column.dataColumn.name] =
                    { mode: 'contains', value: filterTextBox.value };
                _this.dataBind();
            });
            cell.append(filterTextBox);

            return cell;
        },

        _createBodyRow: function (rowElement, row) {
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
                    this._createBodyCell(rowElement, cellElement, row, column);

                rowElement.append(cellElement);
            }
        },

        _createBodyCell: function (rowElement, cellElement, row, column) {
            if (typeof column.horizontal !== 'undefined')
                cellElement.css('text-align', column.horizontal);


            if (ns.GridHelper.isDataColumn(column)) {
                cellElement.append(ns.value(row, column.dataColumn.name));
            }

            else if (ns.GridHelper.isCommandColumn(column)) {
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

        _fireBodyRowCreated: function (args) {
            var i,
                handlers = this._events.bodyRowCreated;
            for (i = 0; i < handlers.length; ++i) {
                handlers[i](args);
            }
        },

        _fireBodyCellCreated: function (args) {
            var i,
                handlers = this._events.bodyCellCreated;
            for (i = 0; i < handlers.length; ++i) {
                handlers[i](args);
            }
        },

        _firePageIndexChanged: function () {
            var i,
                handlers = this._events.pageIndexChanged;
            for (i = 0; i < handlers.length; ++i)
                handlers[i]();
        },

        _firePageSizeChanged: function () {
            var i,
                handlers = this._events.pageSizeChanged;
            for (i = 0; i < handlers.length; ++i)
                handlers[i]();
        },

        _fireItemsCountChanged: function (count) {
            var i,
                handlers = this._events.itemsCountChanged;
            for (i = 0; i < handlers.length; ++i)
                handlers[i](count);
        },
        
        _fireDataBinding: function () {
            var i,
                handlers = this._events.dataBinding;
        
            for (i = 0; i < handlers.length; ++i) {
                handlers[i]();
            }
        },

        _fireDataBound: function () {
            var i,
                handlers = this._events.dataBound;
            for (i = 0; i < handlers.length; ++i)
                handlers[i]();
        },

        _sortButton_OnClick: function (button, dataColumn) {
            if (this._sortingArgs.column === dataColumn.name) {
                if (this._sortingArgs.direction === ns.SortDirection.Ascending)
                {
                    this._sortingArgs.direction = ns.SortDirection.Descending;
                    this._sortingButton.removeClass('SortAsc');
                    this._sortingButton.addClass('SortDesc');
                }
                else
                {
                    this._sortingArgs.direction = ns.SortDirection.Ascending;
                    this._sortingButton.removeClass('SortDesc');
                    this._sortingButton.addClass('SortAsc');
                }
            }

            else {
                if (this._sortingButton) {
                    this._sortingButton.removeClass('SortAsc');
                    this._sortingButton.removeClass('SortDesc');
                }
                
                this._sortingButton = button;
                this._sortingArgs.column = dataColumn.name;
                this._sortingArgs.direction = ns.SortDirection.Ascending;
                this._sortingButton.addClass('SortAsc');
            }

            this.dataBind();
        },
        
        _clearBody: function () {
            if (!this._bodyElement) {
                this._bodyElement = $('<tbody></tbody>');
                this._element.append(this._bodyElement);
            }

            this._bodyElement.empty();
        },

        _createDataRows: function (data) {
            if (!data) {
                return;
            }
            
            var i,
                dataItem,
                rowElement,
                eventArgs;
            for (i = 0; i < data.length; ++i) {
                dataItem = data[i];
                rowElement = $('<tr></tr>');

                eventArgs = new ns.GridRowCreatedEventArgs(this, rowElement, dataItem);
                this._fireBodyRowCreated(eventArgs);

                if (!eventArgs.isDefaultPrevented())
                    this._createBodyRow(rowElement, dataItem);

                this._bodyElement.append(rowElement);
            }
        },

        _createEmptyDataRow: function () {
            if (this._getColumns().length === 0)
                return;

            var emptyDataText = this.getEmptyDataText();
            if (!emptyDataText)
                return;

            var cellElement = $('<td></td>');
            cellElement.attr('colspan', this._getColumns().length);
            cellElement.append(emptyDataText);

            var rowElement = $('<tr></tr>');
            rowElement.append(cellElement);
            this._bodyElement.append(rowElement);
        },
        
        _appendData: function (data) {
            if (data.data && data.data.length > 0) {
                this._createDataRows(data.data);
            }
            else {
                this._createEmptyDataRow();
            }

            this._fireItemsCountChanged(data.count);
            this._fireDataBound();
        },

        _dataSource_OnRead: function (data) {
            this._clearBody();
            this._appendData(data);
        },
        
        addColumns: function (columns) {
            var i;
            for (i = 0; i < columns.length; ++i) {
                this._columns.push(columns[i]);
            }
            
            this._recreateHeaderRow();
            this._clearBody();
        },
        
        addDataColumn: function (name, options) {
            var column = {
                dataColumn: {
                    name: name
                }
            };
            
            ns.apply(column, options);
            this._columns.push(column);
            
            this._recreateHeaderRow();
            this._clearBody();
        },
        
        addCommandColumn: function (name, options, title, handler) {
            var column = {
                commandColumn: {
                    name: name,
                    title: title,
                    handler: handler
                }
            };
            
            ns.apply(column, options);
            this._columns.push(column);
            
            this._recreateHeaderRow();
            this._clearBody();
        },
        
        setDataSource: function (dataSource) {
            this._dataSource = dataSource;
        },
        
        getDataSource: function () {
            return this._dataSource;
        },
        
        setEmptyDataText: function (text) {
            this._emptyDataText = text;
        },
        
        getEmptyDataText: function () {
            return this._emptyDataText;
        },

        setSortingEnabled: function (sortingEnabled) {
            if (sortingEnabled === this._sortingEnabled)
                return;

            this._sortingEnabled = sortingEnabled;
            this._recreateHeaderRow();
        },

        setDefaultSorting: function (column, direction) {
            this._sortingArgs.column = column;
            this._sortingArgs.direction = direction;
            
            var i, columnInfo;
            for (i = 0; i < this._columns.length; ++i) {
                columnInfo = this._columns[i];
                if (columnInfo.dataColumn && columnInfo.dataColumn.name === column) {
                    if (this._sortingButton) {
                        this._sortingButton.removeClass('SortAsc');
                        this._sortingButton.removeClass('SortDesc');
                    }
                    
                    this._sortingButton = columnInfo._sortingButton;
                    if (direction === ns.SortDirection.Ascending) {
                        this._sortingButton.addClass('SortAsc');
                    }
                    else {
                        this._sortingButton.addClass('SortDesc');
                    }
                }
            }
        },

        setPagingEnabled: function (pagingEnabled) {
            this._pagingEnabled = pagingEnabled;
        },

        setPageSize: function (size) {
            this._pagingArgs.size = size;
            this._firePageSizeChanged();
        },

        setPageIndex: function (index) {
            this._pagingArgs.index = index;
            this._firePageIndexChanged();
        },

        setFilteringEnabled: function (filteringEnabled) {
            if (filteringEnabled === this._filteringEnabled)
                return;

            this._filteringEnabled = filteringEnabled;
            this._recreateHeaderRow();
        },

        onBodyRowCreated: function (handler) {
            this._events.bodyRowCreated.push(handler);
        },

        onBodyCellCreated: function (handler) {
            this._events.bodyCellCreated.push(handler);
        },

        onDataBinding: function (handler) {
            this._events.dataBinding.push(handler);
        },

        onDataBound: function (handler) {
            this._events.dataBound.push(handler);
        },


        // #region ISortable interface

        isSortingEnabled: function () {
            return this._sortingEnabled;
        },

        // #endregion ISortable interface

        // #region IPageable interface

        dataBind: function () {
            var pagingArgs = this._pagingEnabled ? this._pagingArgs : null;
            var sortingArgs = this._sortingEnabled && this._sortingArgs.column ? this._sortingArgs : null;
            var filteringArgs = this._filteringEnabled ? this._filteringArgs : null;

            var _this = this;
            
            this._fireDataBinding();
            
            this._dataSource.read(
                function (data) { _this._dataSource_OnRead(data); },
                pagingArgs,
                sortingArgs,
                filteringArgs
            );
        },

        getPageIndex: function () {
            return this._pagingArgs.index;
        },

        getPageSize: function () {
            return this._pagingArgs.size;
        },

        isPagingEnabled: function () {
            return this._pagingEnabled;
        },

        onPageIndexChanged: function (handler) {
            this._events.pageIndexChanged.push(handler);
        },

        onPageSizeChanged: function (handler) {
            this._events.pageSizeChanged.push(handler);
        },

        onItemsCountChanged: function (handler) {
            this._events.itemsCountChanged.push(handler);
        },

        // #endregion IPageable interface

        getElement: function() {
            return this._element;
        }
    });

} (PlatformUI));