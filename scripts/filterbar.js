(function (ns) {

    // ******************** Templates ********************
    ns.FilterBarTemplate =
        '<div class="PlatformUI-Control PlatformUI-Filter">\
            <div>\
                <a href="javascript:void(0)" class="addButton">Добавить фильтр</a>\
                <a href="javascript:void(0)" class="applyButton">Применить фильтр</a>\
                <a href="javascript:void(0)" class="clearButton">Очистить фильтр</a>\
            </div>\
            <div class="NoFilterLabel">Фильтр не задан</div>\
            <div class="Items"></div>\
        </div>';
    
    ns.FilterBarItemTemplate =
        '<div class="Item">\
            <table>\
                <tr>\
                    <td class="Remove">\
                        <a href="javascript: void(0)" class="RemoveButton" title="Убрать фильтр"></a>\
                    </td>\
                    <td class="Field">\
                        <select class="fieldDdl"></select>\
                    </td>\
                    <td class="Operation">\
                        <select class="operatorDdl" disabled></select>\
                    </td>\
                    <td class="Value">\
                        <input type="text" class="DummyValue" disabled value="Значение" />\
                        <div class="ValueContainer"></div>\
                    </td>\
                </tr>\
            </table>\
        </div>';
    

    // ******************** FilterBar ********************
    ns.FilterBar = function (dataControl, element) {
        if (element)
            this._el = $(ns.element(element));
        else
            this._el = $('<div></div>');
        
        this._dataControl = dataControl;
        this._fields = [];
        this._items = [];
        this._events = {
        };
        this._appliedFilter = [];
        
        this._noFilterLabel = null;
        this._itemsContainer = null;
        this._itemId = 0;
        
        this._providers = {
            string: new ns.StringFilterProvider(),
            number: new ns.NumberFilterProvider()
        };
        
        this._init();
    };	

    ns.extend(ns.FilterBar, {
        _init: function () {
            var _this = this;
            
            this._initTemplate();
            
            this._dataControl.getDataSource().onPrepareRequest(
                function (req) {
                    _this._onPrepareDataSourceRequest(req);
                });
        },
        
        _initTemplate: function () {
            var _this = this;
            
            var template = $(ns.FilterBarTemplate);
            this._el.append(template);
            
            var addButtonEl = $('.addButton', template);
            var applyButtonEl = $('.applyButton', template);
            var clearButtonEl = $('.clearButton', template);
            
            var addButton = new PlatformUI.Button(addButtonEl);
            addButton.onClick(function () {
                _this._addItem();
            });
            
            var applyButton = new PlatformUI.Button(applyButtonEl);
            applyButton.onClick(function () {
                _this._apply();
            });
            
            var clearButton = new PlatformUI.Button(clearButtonEl);
            clearButton.onClick(function () {
                _this._clear();
            });
            
            
            this._noFilterLabel = $('.NoFilterLabel', template);
            this._itemsContainer = $('.Items', template);
        },
        
        addFields: function (fields) {
            var i;
            for (i = 0; i < fields.length; ++i) {
                this._fields.push(fields[i]);
            }
            
            this._clear();
        },
        
        _addItem: function () {
            var _this = this;
            
            var itemId = this._itemId;
            ++this._itemId;

            var itemEl = $(ns.FilterBarItemTemplate);
            
            // Remove button.
            var removeButtonEl = $('.RemoveButton', itemEl);
            
            // Field Ddl.
            var fieldDdl = $('.fieldDdl', itemEl);
            ns.fillSelectList(fieldDdl, this._fields, 'text',
                'name', [ { text: '[ Выберите поле ]', value: '' } ]);
            
            // Validation Message.
            var validationMessage = new ns.ValidationMessage(fieldDdl);
            
            // Operator Ddl.
            var operatorDdl = $('.operatorDdl', itemEl);
            ns.fillSelectList(operatorDdl, [], 'text', 'name',
                [ { text: '[ Выберите операцию ]', value: '' } ]);
            
            // Value Container.
            var valueContainer = $('.ValueContainer', itemEl);
            
            // Dummy Value.
            var dummyValue = $('.DummyValue', itemEl);
            
            
            var item = {
                id: itemId,
                item: itemEl,
                fieldDdl: fieldDdl,
                operatorDdl: operatorDdl,
                valueContainer: valueContainer,
                dummyValue: dummyValue,
                validationMessage: validationMessage,
                valueControl: null
            };
            this._items.push(item);
            
            this._itemsContainer.append(itemEl);
            this._noFilterLabel.hide();
            
            removeButtonEl.click(function () {
                _this._onRemoveButtonClick(itemId);
            });
                
            fieldDdl.change(function () {
                _this._onItemFieldDdlChange(item);
            });                        
        },
        
        _onRemoveButtonClick: function (itemId) {
            var i;
            for (i = 0; i < this._items.length; ++i) {
                if (this._items[i].id === itemId) {
                    this._items[i].item.remove();
                    this._items.splice(i, 1);
                    break;
                }
            }
            
            if (this._items.length === 0) {
                this._noFilterLabel.show();
            }
        },
        
        _onItemFieldDdlChange: function (item) {
            var fieldName = item.fieldDdl.val();
            if (!fieldName) {
                item.operatorDdl.prop('disabled', true);
                item.valueControl = null;
                item.valueContainer.empty();
                item.dummyValue.show();
                return;
            }
            
            var provider = this._getProvider(fieldName);
            
            ns.fillSelectList(item.operatorDdl, provider.getOperators(), 'text',
                'name', [ { text: '[ Выберите операцию ]', value: '' } ]);

            item.operatorDdl.prop('disabled', false);
            item.dummyValue.hide();
            
            var valueControl = provider.createValueControl();
            item.valueControl = valueControl;
            item.valueContainer.empty();
            item.valueContainer.append(provider.getValueDOMElement(item));
        },
        
        _getProvider: function (fieldName) {
            var i,
                field,
                provider = null;
            for (i = 0; i < this._fields.length; ++i) {
                field = this._fields[i];
                if (field.name === fieldName) {
                    provider = this._providers[field.type];                    
                    break;
                }
            }
            
            return provider;
        },
        
        _getFieldType: function (fieldName) {
            var i,
                field,
                type = null;
            for (i = 0; i < this._fields.length; ++i) {
                field = this._fields[i];
                if (field.name === fieldName) {
                    type = field.type;
                    break;
                }
            }
            
            return type;
        },
        
        _apply: function () {
            if (!this._validate()) {
                return;
            }
            
            var filter = [];
            var i,
                item,
                fieldName,
                operatorName,
                provider,
                type,
                value;
            for (i = 0; i < this._items.length; ++i) {
                item = this._items[i];
                fieldName = item.fieldDdl.val();
                operatorName = item.operatorDdl.val();
                provider = this._getProvider(fieldName);
                value = provider.getValue(item);
                type = this._getFieldType(fieldName);
                
                filter.push({
                    field: fieldName,
                    operator: operatorName,
                    value: value,
                    type: type
                });
            }
            
            this._appliedFilter = filter;
            this._dataControl.dataBind();
        },
        
        _onPrepareDataSourceRequest: function (req) {
            req.data.filter = this._appliedFilter;
        },
        
        _validate: function () {
            var valid = true;
            var i,
                item,
                fieldName,
                provider,
                operatorName,
                providerValidation;
            for (i = 0; i < this._items.length; ++i) {
                item = this._items[i];
                
                fieldName = item.fieldDdl.val();
                if (!fieldName) {
                    item.validationMessage.showMessage('Поле не выбрано');
                    valid = false;
                    continue;
                }
        
                operatorName = item.operatorDdl.val();
                if (!operatorName) {
                    item.validationMessage.showMessage('Операция не выбрана');
                    valid = false;
                    continue;
                }
                
                provider = this._getProvider(fieldName);
                providerValidation = provider.validateValue(item);
                
                if (providerValidation !== true) {
                    item.validationMessage.showMessage(providerValidation);
                    valid = false;
                    continue;
                }
            }
            
            return valid;
        },
        
        _clear: function () {
            var i;
            for (i = 0; i < this._items.length; ++i) {
                this._items[i].item.remove();
            }
            
            this._items.splice(0, this._items.length);
            this._noFilterLabel.show();
        }
    });
    
    
    // ******************** StringFilter ********************
    ns.StringFilterProvider = function () {
        this._requiredValidator = new ns.RequiredValidator();
    };
    
    ns.extend(ns.StringFilterProvider, {
        getOperators: function () {
            return [
                { name: 'contains', text: 'Содержит' },
                { name: 'notContains', text: 'Не содержит' },
                { name: 'equals', text: 'Равно' },
                { name: 'notEquals', text: 'Не равно' }
            ];
        },
        
        createValueControl: function () {
            return $('<input type="text" class="InputField" />');
        },
        
        getValueDOMElement: function (item) {
            return item.valueControl;
        },
        
        validateValue: function (item) {
            var value = item.valueControl.val();
            
            if (!this._requiredValidator.validate(value)) {
                return 'Значение не заполнено';
            }
            
            return true;
        },
        
        getValue: function (item) {
            return item.valueControl.val();
        }
    });
    
    
    // ******************** NumberFilter ********************
    ns.NumberFilterProvider = function () {
        this._requiredValidator = new ns.RequiredValidator();
        this._floatFormatValidator = new ns.FloatFormatValidator();
    };
    
    ns.extend(ns.NumberFilterProvider, {
        getOperators: function () {
            return [
                { name: 'equals', text: 'Равно' },
                { name: 'notEquals', text: 'Не равно' },
                { name: 'gt', text: 'Больше' },
                { name: 'lt', text: 'Меньше' }
            ];
        },
        
        createValueControl: function () {
            return $('<input type="text" class="InputField" />');
        },
        
        getValueDOMElement: function (item) {
            return item.valueControl;
        },
        
        validateValue: function (item) {
            var value = item.valueControl.val();
            
            if (!this._requiredValidator.validate(value)) {
                return 'Значение не заполнено';
            }

            if (!this._floatFormatValidator.validate(value)) {
                return 'Значение должно быть числом';
            }
            
            return true;
        },
        
        getValue: function (item) {
            return item.valueControl.val();
        }
    });

} (PlatformUI));