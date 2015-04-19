(function (ns) {

    ns.MessageDialog = function () {	
        this._title = null;
        this._text = null;
        this._closeButton = null;

        this._dialog = null;
        this._events = {
            close: []
        };
        this._closeDefault = true;

        this._init();
    };	

    ns.MessageDialog.prototype = {
        _init: function () {
            var _this = this;

            var text = $('<div></div>');

            var closeButton = new ns.Button();
            closeButton.setText('ОК');
            closeButton.onClick(function () {
                _this._onClose();
            });

            var dialog = new ns.Dialog();
            dialog.setContentElement(text);
            dialog.addCommandElement(closeButton);

            this._dialog = dialog;
            this._text = text;
            this._closeButton = closeButton;
        },

        _onClose: function () {
            var i;
            for (i = 0; i < this._events.close.length; ++i) {
                this._events.close[i]();
            }
            
            if (this.isCloseDefault()) {
                this.hide();
            }
        },

        setTitle: function (title) {
            this._dialog.setTitle(title);
        },

        getTitle: function () {
            return this._dialog.getTitle();
        },

        setText: function (text) {
            this._text.html(text);
        },

        getText: function () {
            return this._text.html();
        },

        setCloseButtonText: function (text) {
            this._closeButton.setText(text);
        },

        getCloseButtonText: function () {
            return this._closeButton.getText();
        },

        setCloseDefault: function (closeDefault) {
            this._closeDefault = closeDefault;
        },
        
        isCloseDefault: function () {
            return this._closeDefault;
        },

        onClose: function (handler) {
            this._events.close.push(handler);
        },

        show: function () {
            this._dialog.show();
        },

        hide: function () {
            this._dialog.hide();
        }
    };

} (PlatformUI));