(function (ns) {
    
    ns.ReferenceField = function (element) {
        this._element = $(element ? ns.element(element) : '<div></div>');
        
        this._text = null;
        this._events = {
            choose: [],
            cancel: []
        };
        
        this._init();
    };
    
    ns.extend(ns.ReferenceField, {
        _init: function () {
            var _this = this;
            
            this._element.addClass('PlatformUI-Control PlatformUI-ReferenceField');
            
            var textEl = $('<input type="text" readonly class="Input" />');
            
            var chooseButtonEl = $('<a href="javascript:void(0)" class="ChooseButton">Выбрать</a>');
            var chooseButton = new PlatformUI.Button(chooseButtonEl);
            chooseButton.onClick(function () {
                _this._onChooseClick();
            });
            
            var cancelButtonEl = $('<a href="javascript:void(0)" class="CancelButton">Отмена</a>');
            var cancelButton = new PlatformUI.Button(cancelButtonEl);
            cancelButton.onClick(function () {
                _this._onCancelClick();
            });
            
            this._text = textEl;
            
            this._element.append(textEl);
            this._element.append(chooseButtonEl);
            this._element.append(cancelButtonEl);
        },
        
        _onChooseClick: function () {
            this._fireOnChoose();
        },
        
        _onCancelClick: function () {
            this._text.val('');
            this._fireOnCancel();
        },
        
        onChoose: function (handler) {
            this._events.choose.push(handler);
        },
        
        _fireOnChoose: function () {
            var i;
            for (i = 0; i < this._events.choose.length; ++i) {
                this._events.choose[i]();
            }
        },
        
        onCancel: function (handler) {
            this._events.cancel.push(handler);
        },
        
        _fireOnCancel: function () {
            var i;
            for (i = 0; i < this._events.cancel.length; ++i) {
                this._events.cancel[i]();
            }
        },
        
        setWidth: function (width) {
            this._text.width(width - 150);
        },
        
        getWidth: function () {
            return this._text.width() + 150;
        },
        
        setText: function (text) {
            this._text.val(text);
        },
        
        getText: function () {
            return this._text.val();
        }
    });
    
} (PlatformUI.ns('PlatformUI')));

