(function (ns) {

    ns.ConfirmDialog = function () {	      
        ns.ConfirmDialog.super.constructor.call(this);

        var _this = this;
        var text = $('<div></div>');

        var yesButton = new ns.Button();
        yesButton.setText('ОК');
        yesButton.onClick(function () {
            _this._onConfirm();
        });

        var noButton = new ns.Button();
        noButton.setText('Отмена');
        noButton.onClick(function () {
            _this._onCancel();
        });
        
        this._events = {
            confirm: [],
            cancel: []
        };

        this.setContentElement(text);
        this.addCommandElement(yesButton);
        this.addCommandElement(noButton);

        this._text = text;
        this._yesButton = yesButton;
        this._noButton = noButton;
    };
    
    ns.inherit(ns.Dialog, ns.ConfirmDialog, {
        _onConfirm: function () {
            var i;
            for (i = 0; i < this._events.confirm.length; ++i)
                this._events.confirm[i]();
        },

        _onCancel: function () {
            this.hide();

            var i;
            for (i = 0; i < this._events.cancel.length; ++i) {
                this._events.cancel[i]();
            }
        },

        setText: function (text) {
            this._text.text(text);
        },

        getText: function () {
            return this._text.text();
        },

        setYesButtonText: function (text) {
            this._yesButton.setText(text);
        },

        getYesButtonText: function () {
            return this._yesButton.getText();
        },

        setNoButtonText: function (text) {
            this._noButton.setText(text);
        },

        getNoButtonText: function () {
            return this._noButton.getText();
        },

        onConfirm: function (handler) {
            this._events.confirm.push(handler);
        },

        onCancel: function (handler) {
            this._events.cancel.push(handler);
        }
    });

} (PlatformUI));