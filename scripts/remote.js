(function (ns) {

    ns.remoteMarkup = function (url, method) {
        var options = {
            type: method || 'GET',
            dataType: 'html'
        };

        var deferred = $.Deferred();

        $.ajax(url, options)
            .done(function (data) {
                deferred.resolve(data);
            })
            .fail(function () { 
                deferred.reject();
            });

        return deferred;
    };


    ns.remoteScript = function (url, method) {
        var options = {
            type: method || 'GET',
            dataType: 'script'
        };

        var deferred = $.Deferred();

        $.ajax(url, options)
            .done(function () {
                deferred.resolve();
            })
            .fail(function () {
                deferred.reject();
            });

        return deferred;
    };


    ns.remoteData = function (url, data, method, contentType) {
        var options = {
            type: method || 'POST',
            data: data,
            dataType: 'text'
        };

        if (contentType)
            options.contentType = contentType;


        var deferred = $.Deferred();

        $.ajax(url, options)
            .done(function (data) {
                deferred.resolve(data);
            })
            .fail(function () {
                deferred.reject();
            });

        return deferred;
    };


    ns.remoteJSON = function (url, data, method) {
        var options = {
            type: method || 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json'
        };

        var deferred = $.Deferred();

        $.ajax(url, options)
            .done(function (data) {
                deferred.resolve(data);
            })
            .fail(function () {
                deferred.reject();
            });

        return deferred;
    };


    ns.remoteIframe = function (formEl, url) {
        var _form = ns.element(formEl),
            _iframe;


        _initControls();


        function _iframe_onLoad() {
            var deferred = ns._iframeActiveRequests[_form.id];

            var doc = _iframe.contentDocument;
            var response = doc.body.textContent;

            delete ns._iframeActiveRequests[_form.id];

            deferred.resolve(response);
        }

        function _initControls() {
            var iframe;

            if (_form.id) {
                if (ns._iframeActiveRequests[_form.id])
                    throw 'Active request in progress.';
            }
            else
                _form.id = ns.nextId();


            if (!_form.target) {
                var id = ns.nextId();
                iframe = document.createElement('iframe');
                iframe.id = id;
                iframe.name = id;
                iframe.style.width = 0;
                iframe.style.height = 0;
                iframe.frameBorder = 0;
                document.body.appendChild(iframe);

                _form.target = id;
            }
            else {
                iframe = ns.element(_form.target);
            }

            _form.method = 'POST';
            _form.action = url;


            var done = false;

            if (iframe.onreadystatechange === null) {
                iframe.onreadystatechange = function () {
                    if (!done && (this.readyState &&
                        (this.readyState === 'loaded' || this.readyState === 'complete'))) {
                        done = true;

                        _iframe_onLoad();
                    }
                };
            }
            else {
                iframe.onload = _iframe_onLoad;
            }

            _iframe = iframe;
        }

        if (ns._iframeActiveRequests[_form.id])
            throw 'Active request in progress.';


        var deferred = $.Deferred();
        ns._iframeActiveRequests[_form.id] = deferred;

        _form.submit();

        return deferred;
    };

    ns._iframeActiveRequests = {};
    
} (PlatformUI));
