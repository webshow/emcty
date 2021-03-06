/**
 * @license
 * emcty 0.1
 * aohailin@gmail.com`
 */
(function(root) {
    var _cache = {},
        _plugin,
        _setting = {
            startTag: '<%',
            evaluate: '=',
            escape: '-',
            endTag: '%>'
        },
        _formatMap = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        },
        _formatReg = /\\|'|\r|\n|\t|\u2028|\u2029/g,
        _formatHandler = function(match) {
            return '\\' + _formatMap[match]
        },
        _format = function(s) {
            return _formatReg.test(s) ? s.replace(_formatReg, _formatHandler) : s
        },
        _escapeMap = {
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '`': '&#96;',
            '"': '&quot;',
            '&': '&amp;'
        },
        _escapeReg = /<|>|'|"|&|`/g,
        _escapeHandler = function(s) {
            return _escapeMap[s]
        },
        _escape = function(s) {
            return _escapeReg.test(s) ? s.replace(_escapeReg, _escapeHandler) : s
        },
        _compile = function(t) {
            var startIndex = 0,
                endIndex = 0,
                sourceCode = '',
                tempLen = t.length;
            var startIndex = t.indexOf(_setting.startTag);
            while (startIndex > 0 && startIndex < tempLen) {
                if (endIndex < startIndex) {
                    sourceCode += _format(t.substring(endIndex + 2, startIndex))
                }
                endIndex = t.indexOf(_setting.endTag, startIndex);
                if (endIndex < 0) {
                    endIndex = startIndex - 2;
                    break;
                }
                switch (t.charAt(startIndex + 2)) {
                    case _setting.evaluate:
                        sourceCode += "'+\n((__t=(" + t.substring(startIndex + 3, endIndex) + "))==null?'':__t)+\n'";
                        break;
                    case _setting.escape:
                        sourceCode += "'+\n__escape(" + t.substring(startIndex + 3, endIndex) + ")+\n'";
                        break;
                    default:
                        sourceCode += "';\n" + t.substring(startIndex + 2, endIndex) + "\n__p+='";
                        break;
                }
                startIndex = t.indexOf(_setting.startTag, endIndex)
            }
            if (sourceCode == '') {
                sourceCode = _format(t)
            } else if (endIndex + 2 < tempLen) {
                sourceCode += _format(t.substring(endIndex + 2, tempLen))
            }
            sourceCode = "var __t='',__p='" + sourceCode + "';\nreturn __p";
            try {
                var _tempFunc = new Function('model', '__escape', 'plugin', sourceCode);
                var render = function(data) {
                    return _tempFunc.call(this, data, _escape, _plugin)
                };
                render.source = "function(model){\n" + sourceCode + "\n}";
                return render
            } catch (e) {
                e.source = sourceCode;
                throw e
            }
        },
        _emcty = {
            setting: function(setting) {
                for (var s in setting)
                    _setting.hasOwnProperty(s) && (_setting[s] = setting[s]);
                if (_setting.startTag.length != 2 || _setting.endTag.length != 2) {
                    throw new Error('tag format error.')
                }
            },
            plugin: function(plugin) {
                _plugin = plugin
            },
            template: function(tempId, template) {
                return tempId ? _cache[tempId] = _compile(template) : _compile(template) 
            },
            render: function(tempId, model) {
                return _cache.hasOwnProperty(tempId) ? _cache[tempId](model) : null
            }
        };
    root.emcty = _emcty;
    if (typeof define === 'function' && define.amd) {
        define('emcty', [], function() {
            return _emcty
        })
    }
})(this)