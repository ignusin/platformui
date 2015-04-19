(function (ns) {
    
    ns.LocalDataSource = function (data) {
        this._data = data;
        this._filterDataHandler = null;
    };  

    ns.LocalDataSource.prototype = {
        _fireOnFilterData: function (dataArray, filteringArgs, optionalArgs) {
            if (this._filterDataHandler)
                return this._filterDataHandler(dataArray, filteringArgs, optionalArgs);
            else
                return dataArray;
        },

        setOnFilterData: function (handler) {
            this._filterDataHandler = handler;
        },

        _createSortFunction: function (column, direction) {
            if (direction === ns.SortDirection.Ascending) {
                return function (x, y) {
                    if (x[column] < y[column])
                        return -1;

                    if (x[column] > y[column])
                        return 1;

                    return 0;
                };
            }
            else {
                return function (x, y) {
                    if (x[column] < y[column])
                        return 1;

                    if (x[column] > y[column])
                        return -1;

                    return 0;
                };
            }
        },

        read: function (callback, pagingArgs, sortingArgs, filteringArgs, optionalArgs) {
            var resultData = this._data;
            var result = { count: -1, data: resultData };
            var i;

            if ((optionalArgs && Object.keys(optionalArgs).length > 0)
                || (filteringArgs && Object.keys(filteringArgs).length > 0)) {
                resultData = this._fireOnFilterData(resultData, filteringArgs, optionalArgs);
            }

            if (ns.hasSortingArgs(sortingArgs)) {
                var copy = new Array(resultData.length);

                for (i = 0; i < resultData.length; ++i)
                    copy[i] = resultData[i];

                copy.sort(this._createSortFunction(sortingArgs.column, sortingArgs.direction));
                resultData = copy;
            }

            if (ns.hasPagingArgs(pagingArgs)) {
                var pagedData = new Array(pagingArgs.size);

                var min = (pagingArgs.index - 1) * pagingArgs.size,
                    max = pagingArgs.index * pagingArgs.size;
                for (i = min; i < max; ++i)
                    pagedData[i - min] = resultData[i];

                result.count = resultData.length;
                resultData = pagedData;
            }

            result.data = resultData;
            callback.call(this, result);
        }
    };



    ns.RequestFormat = {
        Json: 'json',
        Post: 'post'
    };



    ns.RemoteDataSource = function (readUrl, requestFormat) {
        this._events = {
            prepareRequest: [],
            prepareResponse: []
        };

        this._readUrl = readUrl;

        this._requestFormat = typeof requestFormat === 'undefined'
                                ? ns.RequestFormat.Json
                                : requestFormat;
    };

    ns.RemoteDataSource.prototype = {
        _onRequestSuccess: function (response, callback) {
            var data;
            if (this._requestFormat === ns.RequestFormat.Post)
                data = JSON.parse(response);
            else
                data = response;

            this.prepareResponse({ data: data });
            
            callback(data);
        },

        prepareResponse: function (ev) {
            this._fireOnPrepareResponse(ev);
        },

        _fireOnPrepareRequest: function (ev) {
            var i;
            for (i = 0; i < this._events.prepareRequest.length; ++i) {
                this._events.prepareRequest[i](ev);
            }
        },

        _fireOnPrepareResponse: function (ev) {
            var i;
            for (i = 0; i < this._events.prepareResponse.length; ++i) {
                this._events.prepareResponse[i](ev);
            }
        },

        onPrepareRequest: function (handler) {
            this._events.prepareRequest.push(handler);
        },

        onPrepareResponse: function (handler) {
            this._events.prepareResponse.push(handler);
        },

        read: function (callback, pagingArgs, sortingArgs, filteringArgs, optionalArgs) {
            var sendData = {
                pageIndex: 0,
                pageSize: 0,
                sortColumn: '',
                sortDirection: ns.SortDirection.Ascending
            };

            if (ns.hasPagingArgs(pagingArgs)) {
                sendData.pageIndex = pagingArgs.index;
                sendData.pageSize = pagingArgs.size;
            }

            if (ns.hasSortingArgs(sortingArgs)) {
                sendData.sortColumn = sortingArgs.column;
                sendData.sortDirection = sortingArgs.direction;
            }
            
            if (optionalArgs) {
                ns.apply(sendData, optionalArgs);
            }

            if (filteringArgs) {
                var filter = {};

                var filterKey;
                for (filterKey in filteringArgs) {
                    if (!filteringArgs[filterKey])
                        continue;

                    filter[filterKey] = filteringArgs[filterKey];
                }

                sendData['filter'] = JSON.stringify(filter);
            }


            this._fireOnPrepareRequest({ data: sendData });

            var deferred;
            if (this._requestFormat === ns.RequestFormat.Json) {
                deferred = ns.remoteJSON(this._readUrl, sendData);
            }
            else {
                var serialized = ns.serialize(sendData);
                deferred = ns.remoteData(this._readUrl, serialized);
            }

            var _this = this;
            deferred
                .done(function (r) {
                    _this._onRequestSuccess(r, callback);
                });
        }
    };
} (PlatformUI));