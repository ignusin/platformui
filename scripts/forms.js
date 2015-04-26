(function (ns) {

    ns.getInputValue = function (input) {
        if (input.getInputValue) {
            return input.getInputValue();
        }

        input = ns.element(input);

        if (input.tagName.toLowerCase() === 'input' && input.type.toLowerCase() === 'checkbox')
            return input.checked;
        else
            return input.value;
    };

    ns.setInputValue = function (input, value) {
        if (input.setInputValue) {
            input.setInputValue(value);
            return;
        }

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
        if (input.setInputValue) {
            input.setInputValue(null);
            return;
        }

        input = ns.element(input);

        if (input.tagName.toLowerCase() === 'input' && input.type.toLowerCase() === 'checkbox')
            input.checked = false;
        else
            input.value = '';
    };

    ns.setInputEnabled = function (input, enabled) {
        if (input.setEnabled) {
            input.setEnabled(enabled);
            return;
        }

        ns.element(input).disabled = !enabled;
    };

    ns.getInputEnabled = function (input) {
        if (input.isEnabled) {
            return input.isEnabled();
        }

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
        this._customControls = {};

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

            var key;
            for (key in this._customControls) {
                if (!this._customControls.hasOwnProperty(key)) {
                    continue;
                }

                this._fields[key] = ns.getInputValue(this._customControls[key]);
            }
        },

        _customControl_OnChange: function (name) {
            this._fields[name] = ns.getInputValue(this._customControls[name]);
        },

        addCustomControl: function (name, control) {
            var _this = this;

            _this._customControls[name] = control;
            _this._fields[name] = ns.getInputValue(control);
            _this._enabled[name] = control.isEnabled();

            control.onInputValueChanged(
                function () { _this._customControl_OnChange(name); }
            );
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

            var key;
            for (key in this._customControls) {
                if (!this._customControls.hasOwnProperty(key)) {
                    continue;
                }

                ns.resetInputValue(this._customControls[key]);
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

            if (this._customControls[name]) {
                ns.setInputValue(this._customControls[name], value);
                this._fields[name] = value;
            }
        },

        getValue: function (name) {
            return this._fields[name];
        },

        getInputElement: function (name) {
            return this._form[name] || this._customControls[name];
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

            if (this._customControls[name]) {
                this._customControls[name].setEnabled(enabled);
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

            var key;
            for (key in this._customControls) {
                if (!this._customControls.hasOwnProperty(key)) {
                    continue;
                }

                this._customControls[key].setEnabled(enabled);
            }
        },

        getData: function () {
            this._updateFieldsData();
            
            var result = {};
            var key;
            for (key in this._fields) {
                ns.setValue(result, key, this._fields[key]);
            }

            return result;
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

        _toFlatObject: function (rootPath, obj, flatObj) {
            var key,
                curPath;

            for (key in obj) {
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }
                
                curPath = rootPath + (rootPath ? '.' : '') + key;

                if (obj[key] && typeof obj[key] === 'object') {
                    this._toFlatObject(curPath, obj[key], flatObj);
                }
                else {
                    flatObj[curPath] = obj[key];
                }
            }
        },

        setData: function (obj) {
            var flatObj = {};
            this._toFlatObject('', obj, flatObj);

            var key;
            var ccKey;
            var i;
            for (key in flatObj) {
                for (i = 0; i < this._form.length; ++i) {
                    if (key === this._form.elements[i].name || (
                        this._form.elements[i].name.length > key.length + 1
                            && this._form.elements[i].name.substr(0, key.length + 1) === key + '.')
                    ) {
                        ns.setInputValue(this._form.elements[i], flatObj[key]);
                        this._fields[this._form.elements[i].name] = flatObj[key];

                        break;
                    }
                }

                for (ccKey in this._customControls) {
                    if (this._customControls.hasOwnProperty(ccKey)) {
                        if (key === ccKey || (
                            ccKey.length > key.length + 1
                                && ccKey.substr(0, key.length + 1) === key + '.')
                        ) {
                            ns.setInputValue(this._customControls[ccKey], flatObj[key]);
                            this._fields[ccKey] = flatObj[key];
                        }
                    }
                }
            }
        }
    };

} (PlatformUI));