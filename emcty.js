(function () {
    var _cache = {},
    _encode = function (s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
    },
    _trimTemp=function(t){
        return t.replace(/\r|\n|\t|^s+|s+$/g, '').replace(/\s+</g,'<').replace(/>\s+/g,'>')
    },
    _compile = function (t) {
        t=_trimTemp(t);
        var cs = false,ce = false,sa = "var _='';",ct='',ht='';
        for (var i = 0, l = t.length; i < l; i++) {
            var c = t.charAt(i);
            if (!cs && c == '<' && i < l - 1 && t.charAt(i + 1) == '%') {
                if(ht.length>0){
                    sa+="_+='"+ht.replace(/'/g, "\\'")+"';";
                    ht=''
                }
                cs = true;
                i++;
                continue
            } 
            if (cs && c == '>' && t.charAt(i - 1) == '%') {
                ct=ct.slice(0,ct.length-1);
                cs = false;
                ce = true
            } 
            if(cs&&!ce){
                ct+=c
            }else if(ce){
                var d=ct.charAt(0);
                if (d== '=') {
                    sa += '_+=' + ct.slice(1) + ';'
                } else if (d == ':') {
                    sa += '_+=' + _encode(ct.slice(1)) + ';'
                } else {
                    sa += ct
                }
                ct='';
                cs=false;
                ce=false
            }else{
                ht+=c
            }
        }
        if(ht.length>0){
            sa+="_+='"+ht.replace(/'/g, "\\'")+"';"
        }
        sa += "return _";
        return new Function(Array.prototype.slice.call(arguments).slice(1), sa)
    },
    _emcty = {
        compile: _compile,
        render: function (cacheId,model) {
            var cacheEngine = _cache[cacheId];
            if(cacheEngine==null)return null;
            return cacheEngine(model)
        },
        set: function (cacheId, template) {
            _cache[cacheId] = _compile(template, 'model')
        },
        get: function (cacheId) {
            return _cache.hasOwnProperty(cacheId) ? _cache[cacheId] : null
        },
        remove: function (cacheId) {
            _cache.hasOwnProperty(cacheId) && delete _cache[cacheId]
        },
        clear: function () {
            _cache = {}
        }
    };
    //export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = _emcty
    } else {
        window.emcty = _emcty
    }
})()