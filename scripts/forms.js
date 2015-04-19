(function (ns) {

    ns.getInputValue = function (input) {
        input = ns.element(input);

        if (input.tagName.toLowerCase() === 'input' && input.type.toLowerCase() === 'checkbox')
            return input.checked;
        else
            return input.value;
    };

    ns.setInputValue = function (input, value) {
        input = ns.element(input);

        if (input.tagName.toLowerCase() === 'input' && input.type.toLowerCase() === 'checkbox') {
            if (value)
                input.checked = true;
            else
                input.checked = false;
        }
        else {
            if (value === undefined || value === null)
                input.value = '';
            else
                input.value = value;
        }
    };

    ns.resetInputValue = function (input) {
        input = ns.element(input);

        if (input.tagName.toLowerCase() === 'input' && input.type.toLowerCase() === 'checkbox')
            input.checked = false;
        else
            input.value = '';
    };

    ns.setInputEnabled = function (input, enabled) {
        ns.element(input).disabled = !enabled;
    };

    ns.getInputEnabled = function (input) {
        return !ns.element(input).disabled;
    };

    ns.hasSelectItems = function (select) {
        var length = $('option', select).length;
        return length > 0;
    };

    ns.selectFirstItem = function (select) {
        var options = $('option', select);
        if (options.length > 0) {
            select.selectedIndex = 0;
        }
    };

    ns.fillSelectList = function (
            element, data, textKey, valueKey, defaultItems) {

        var el = ns.element(element);
        $(el).empty();

        var item, i, option, text;
        if (defaultItems) {
            for (i = 0; i < defaultItems.length; ++i) {
                item = defaultItems[i];
                option = ns.createElement('option');
                option.value = item.value;

                text = ns.createText(item.text);
                option.appendChild(text);

                el.appendChild(option);
            }
        }

        for (i = 0; i < data.length; ++i) {
            item = data[i];
            option = ns.createElement('option');

            if (typeof valueKey === 'function')
                option.value = valueKey(item);
            else
                option.value = ns.value(item, valueKey);

            if (typeof textKey === 'function')
                text = ns.createText(textKey(item));
            else
                text = ns.createText(ns.value(item, textKey));

            option.appendChild(text);

            el.appendChild(option);
        }
    };



    ns.FormObserver = function (form) {
        this._fields = {};
        this._enabled = {};
        this._form = ns.element(form);

        this._initObserver();
    };

    ns.FormObserver.prototype = {

        _initObserver: function () {
            var _this = this;

            var i,
                input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];

                input.addEventListener('change',
                    function (e) {
                        _this._input_OnChange(e);
                    });
                this._fields[input.name] = ns.getInputValue(input);
                this._enabled[input.name] = !input.disabled;
            }
        },

        _input_OnChange: function (e) {
            this._fields[e.target.name] = ns.getInputValue(e.target);
        },

        _updateFieldsData: function () {
            var i,
                input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];
                this._fields[input.name] = ns.getInputValue(input);
            }
        },

        reset: function () {
            this._form.reset();

            var i,
                input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];
                ns.resetInputValue(input);

                this._fields[input.name] = '';
            }
        },

        getElement: function () {
            return this._form;
        },

        setValue: function (name, value) {
            var i, input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];

                if (input.name === name) {
                    ns.setInputValue(input, value);
                    this._fields[name] = value;

                    return;
                }
            }
        },

        getValue: function (name) {
            return this._fields[name];
        },

        getInputElement: function (name) {
            return this._form[name];
        },

        isEnabled: function (name) {
            return this._enabled[name];
        },

        setEnabled: function (name, enabled) {       
            var i,
                input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];

                if (input.name === name) {
                    input.disabled = !enabled;
                    this._enabled[name] = enabled;

                    return;
                }
            }
        },

        setFormEnabled: function (enabled) {
            var i,
                input;
            for (i = 0; i < this._form.length; ++i) {
                input = this._form.elements[i];
                input.disabled = !enabled;

                this._enabled[input.name] = enabled;
            }
        },

        getData: function () {
            this._updateFieldsData();
            return this._fields;
        },

        serialize: function () {
            return this.getSerializer().toString();
        },

        getSerializer: function () {
            var s = new ns.QueryStringSerializer();
            var data = this.getData();
            var key;

            for (key in data)
                s.append(key, data[key]);

            return s;
        },

        setData: function (obj) {
            var key;
            var i;
            for (key in obj) {
                for (i = 0; i < this._form.length; ++i) {
                    if (key === this._form.elements[i].name) {
                        ns.setInputValue(this._form.elements[i], obj[key]);
                        this._fields[key] = obj[key];

                        break;
                    }
                }
            }
        }
    };

} (PlatformUI));