(function (ns) {

    // ******************** Element handies ********************

    ns.createElement = function (tag) {
        return document.createElement(tag);
    };

    ns.createText = function (text) {
        return document.createTextNode(text);
    };

    ns.htmlToJQuery = function (html) {
        return $($.trim(html));
    };

    ns.appear = function (el, options) {
        if (options)
            options.duration = 200;
        else
            options = { duration: 200 };

        $(el).fadeIn(options);
    };

    ns.disappear = function (el, options) {
        if (options)
            options.duration = 200;
        else
            options = { duration: 200 };

        $(el).fadeOut(options);
    };

    ns._nextZIndex = 1000;
    ns.nextZIndex = function () {
        return ns._nextZIndex++;
    };

    ns._idSequence = 1;
    ns.nextId = function () {
        return 'element_' + (ns._idSequence++).toString();
    };
    
    ns.redirect = function (url) {
        window.location.href = url;
    };


    // ******************** PagingArgs & SortingArgs ********************

    ns.SortDirection = { Ascending: 0, Descending: 1 };

    ns.hasPagingArgs = function (pagingArgs) {
        return pagingArgs && pagingArgs.index > 0 && pagingArgs.size > 0;
    };

    ns.hasSortingArgs = function (sortingArgs) {
        return sortingArgs && sortingArgs.column;
    };


    // ******************** Serialization ********************

    ns.QueryStringSerializer = function () {
        this._result = '';
    };    

    ns.QueryStringSerializer.prototype = {
        append: function (key, value) {
            if (this._result !== '')
                this._result += '&';

            this._result += key;
            this._result += '=';
            this._result += encodeURIComponent(value);
        },

        toString: function () {
            return this._result;
        }
    };

    ns.serialize = function (obj) {
        var key;
        var s = new ns.QueryStringSerializer();
        for (key in obj)
            s.append(key, obj[key]);

        return s.toString();
    };


    // ******************** Dates ********************

    ns._zeroPad = function (s, n) {
        s = s.toString();

        if (s.length < n) {
            var diff = n - s.length;
            for (var i = 0; i < diff; ++i)
                s = '0' + s;
        }

        return s;
    };

    ns.today = function () {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    ns.compareDates = function (date1, date2) {
        return date1.getFullYear() === date2.getFullYear()
            && date1.getMonth() === date2.getMonth()
            && date1.getDate() === date2.getDate();
    };

    ns.formatDate = function (date) {
        var result = ns._zeroPad(date.getDate(), 2) + '.'
                + ns._zeroPad(date.getMonth() + 1, 2) + '.'
                + ns._zeroPad(date.getFullYear(), 4);

        return result;
    };

    ns.formatDateTime = function (date, showSeconds) {
        var result = ns._zeroPad(date.getDate(), 2) + '.'
                + ns._zeroPad(date.getMonth() + 1, 2) + '.'
                + ns._zeroPad(date.getFullYear(), 4) + ', '
                + ns._zeroPad(date.getHours(), 2) + ':'
                + ns._zeroPad(date.getMinutes(), 2);

        if (showSeconds !== false)
            result += ':' + ns._zeroPad(date.getSeconds(), 2);

        return result;
    };


    ns.parseDate = function (value) {
        //0123456789
        //dd.MM.yyyy
        var day = parseInt(value.substr(0, 2));
        var month = parseInt(value.substr(3, 2));
        var year = parseInt(value.substr(6, 4));

        var date = new Date(year, month - 1, day);
        return date;
    };

    ns.parseDateTime = function (value) {
        //01234567890123456789
        //dd.MM.yyyy, HH:mm:ss
        var day = parseInt(value.substr(0, 2));
        var month = parseInt(value.substr(3, 2));
        var year = parseInt(value.substr(6, 4));
        var hour = parseInt(value.substr(12, 2));
        var minute = parseInt(value.substr(15, 2));
        var second = parseInt(value.substr(18, 2));

        var date = new Date(year, month - 1, day, hour, minute, second);
        return date;
    };


    // ******************** Text ********************

    ns.shortenText = function (text, limit) {
        if (!text) return text;
        if (text.length < limit) return text;

        return text.substr(0, limit) + '...';
    };

    ns.setMultilineText = function (el, text) {
        var elem = $(ns.element(el));
        elem.text(text);
        elem.html(elem.html().replace(/\n/g,'<br/>'));
    };

} (PlatformUI));