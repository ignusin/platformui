(function (ns) {

    ns.Pager = function (dataControl, pagerEl) {
        this._sectionSize = 10;

        if (pagerEl)
            this._pagerEl = $(ns.element(pagerEl));
        else
            this._pagerEl = $('<div></div>');

        this._dataControl = dataControl;
        this._prevPageIndex;
        this._prevPageSize;
        this._count = 0;


        this._prevPageIndex = dataControl.getPageIndex();
        this._prevPageSize = dataControl.getPageSize();

        this._initElement();
        this._createPager();


        var _this = this;

        dataControl.onPageIndexChanged(function () {
            _this._dataControl_OnPageIndexChanged();
        });

        dataControl.onPageSizeChanged(function () {
            _this._dataControl_OnPageSizeChanged();
        });

        dataControl.onItemsCountChanged(function (count) {
            _this._dataControl_OnItemsCountChanged(count);
        });
    };


    ns.Pager.prototype = {
        _initElement: function () {
            this._pagerEl.addClass('PlatformUI-Control PlatformUI-Pager');
        },

        _createPager: function () {
            this._pagerEl.empty();

            if (!this._dataControl.isPagingEnabled()) {           
                return;
            }

            if (this._count <= 0) this._count = 1;


            var maxPages = Math.ceil(this._count / this._prevPageSize);
            var currentPageSection = Math.floor(this._prevPageIndex / this._sectionSize)
                + (this._prevPageIndex % this._sectionSize > 0 ? 1 : 0);
            var maxPageSection = Math.ceil(maxPages / this._sectionSize);


            var firstPageButtonEnabled = (this._prevPageIndex > 1);
            this._pagerEl.append(this._createFirstPageButton(firstPageButtonEnabled));

            var prevSectionButtonEnabled = (currentPageSection > 1);
            this._pagerEl.append(this._createPrevSectionButton(prevSectionButtonEnabled));


            var i,
                pageElement,
                min = (currentPageSection - 1) * this._sectionSize + 1,
                max = currentPageSection * this._sectionSize;

            if (max > maxPages)
                max = maxPages;

            for (i = min; i <= max; ++i) {
                pageElement = this._createPageElement(i);
                this._pagerEl.append(pageElement);
            }


            var nextSectionButtonEnabled = (currentPageSection < maxPageSection);
            this._pagerEl.append(this._createNextSectionButton(nextSectionButtonEnabled));

            var lastPageButtonEnabled = (this._prevPageIndex < maxPages);
            this._pagerEl.append(this._createLastPageButton(lastPageButtonEnabled));
        },

        _createPageElement: function (index) {
            if (index === this._prevPageIndex)
                return this._createCurrentPageElement(index);
            else
                return this._createButtonPageElement(index);        
        },

        _createCurrentPageElement: function (index) {
            var span = $('<span></span>');
            span.addClass('PlatformUI-Page PlatformUI-Selected');
            span.append(index.toString());

            return span;
        },

        _createButtonPageElement: function (index) {
            var _this = this;

            var link = $('<a href="javascript:void(0)"></a>');
            link.append(index.toString());
            link.click(function () {
                _this._onPageButtonClick(index);
            });

            var span = $('<span></span>');
            span.addClass('PlatformUI-Page');
            span.append(link);

            return span;
        },

        _createFirstPageButton: function (enabled) {
            var _this = this;
            var child;

            if (enabled) {
                var link = $('<a href="javascript:void(0)"></a>');
                link.append('<<');
                link.click(function () {
                    _this._onFirstPageClick();
                });

                child = link;
            }
            else
                child = '<<';

            var span = $('<span></span>');
            span.addClass('PlatformUI-Page');
            span.append(child);

            return span;
        },

        _createLastPageButton: function (enabled) {
            var _this = this;
            var child;

            if (enabled) {
                var link = $('<a href="javascript:void(0)"></a>');
                link.append('>>');
                link.click(function () {
                    _this._onLastPageClick();
                });

                child = link;
            }
            else
                child = '>>';

            var span = $('<span></span>');
            span.addClass('PlatformUI-Page');
            span.append(child);

            return span;
        },

        _createPrevSectionButton: function (enabled) {
            var _this = this;
            var child;

            if (enabled) {
                var link = $('<a href="javascript:void(0)"></a>');
                link.append('<');
                link.click(function () {
                    _this._onPrevSectionClick();
                });

                child = link;
            }
            else
                child = '<';

            var span = $('<span></span>');
            span.addClass('PlatformUI-Page');
            span.append(child);

            return span;
        },

        _createNextSectionButton: function (enabled) {
            var _this = this;
            var child;

            if (enabled) {
                var link = $('<a href="javascript:void(0)"></a>');
                link.append('>');
                link.click(function () {
                    _this._onNextSectionClick();
                });

                child = link;
            }
            else
                child = '>';

            var span = $('<span></span>');
            span.addClass('PlatformUI-Page');
            span.append(child);

            return span;
        },

        _onPageButtonClick: function (index) {
            this._dataControl.setPageIndex(index);
            this._dataControl.dataBind();
        },

        _onFirstPageClick: function () {
            this._dataControl.setPageIndex(1);
            this._dataControl.dataBind();
        },

        _onLastPageClick: function () {
            var maxPages = Math.ceil(this._count / this._prevPageSize);

            this._dataControl.setPageIndex(maxPages);
            this._dataControl.dataBind();
        },

        _onPrevSectionClick: function () {
            var currentPageSection = Math.floor(this._prevPageIndex / this._sectionSize)
                + (this._prevPageIndex % this._sectionSize > 0 ? 1 : 0);

            if (currentPageSection <= 1)
                return;


            var index = (currentPageSection - 1) * this._sectionSize;

            this._dataControl.setPageIndex(index);
            this._dataControl.dataBind();
        },

        _onNextSectionClick: function () {
            var maxPages = Math.ceil(this._count / this._prevPageSize);
            var currentPageSection = Math.floor(this._prevPageIndex / this._sectionSize)
                + (this._prevPageIndex % this._sectionSize > 0 ? 1 : 0);
            var maxPageSection = Math.ceil(maxPages / this._sectionSize);

            if (currentPageSection >= maxPageSection)
                return;


            this._dataControl.setPageIndex(currentPageSection * this._sectionSize + 1);
            this._dataControl.dataBind();
        },

        _dataControl_OnPageIndexChanged: function () {
            var newPageIndex = this._dataControl.getPageIndex();

            if (newPageIndex === this._prevPageIndex)
                return;

            this._prevPageIndex = newPageIndex;
            this._createPager();
        },

        _dataControl_OnPageSizeChanged: function () {
            var newPageSize = this._dataControl.getPageSize();

            if (newPageSize !== this._prevPageSize)
                return;

            this._prevPageSize = newPageSize;
            this._createPager();
        },

        _dataControl_OnItemsCountChanged: function (count) {
            if (count === this._count)
                return;

            this._count = count;
            this._createPager();
        },

        getElement: function() {
            return this._pagerEl;
        }
    };

} (PlatformUI));