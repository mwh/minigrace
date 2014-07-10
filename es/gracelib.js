var lineNumber = 0;
var moduleName = "???";
var superDepth = null;
var invocationCount = 0;

function GraceString(s) {
    this._value = s;
}

GraceString.prototype = {
    methods: {
        "++": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            return new GraceString(this._value + o._value);
        },
        "at": function(argcv, other) {
            var o = callmethod(other, 'asString', [0]);
            var idx = parseInt(o._value) - 1;
            return new GraceString(this._value.charAt(idx));
        },
        "size": function(argcv) {
            return new GraceNum(this._value.length);
        },
        "_escape": function(argcv) {
            var tmp = callmethod(this, "replace()with", [2],
                    new GraceString("\\"), new GraceString("\\\\"));
            tmp = callmethod(tmp, "replace()with", [2],
                    new GraceString("\""), new GraceString("\\\""));
            tmp = callmethod(tmp, "replace()with", [2],
                    new GraceString("\n"), new GraceString("\\n"));
            return tmp;
        },
        "replace()with": function(argcv, what, wth) {
            var s = this._value;
            var os = "";
            var sl = what._value.length;
            while ((i = s.indexOf(what._value)) != -1) {
                os += s.substr(0, i);
                os += wth._value;
                s = s.substr(i + sl);
            }
            os += s;
            return new GraceString(os);
        },
        "substringFrom()to": function(argcv, from, to) {
            var s = this._value;
            return new GraceString(s.substring(from._value - 1, to._value));
        },
        "startsWith": function(argcv, needle) {
            var s = this._value;
            var n = needle._value;
            if (s.substring(0, n.length) == n)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "asString": function(argcv) { return this ; },
        "encode": function(argcv) { return this ; }, // TODO this is a hack
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            if (this.prototype == other.prototype
                    && this._value == other._value)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "/=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "iterator": function(argcv) {
            return new GraceStringIterator(this);
        },
        "ord": function(argcv) {
            return new GraceNum(this._value.charCodeAt(0));
        },
        "hashcode": function(argcv) {
            var hc = 0;
            for (var i=0; i<this._value.length; i++) {
                hc *= 23;
                hc += this._value.charCodeAt(i);
                hc %= 0x100000000;
            }
            return new GraceNum(hc);
        },
        "indices": function(argcv) {
            var l = [];
            for (var i=1; i<=this._value.length; i++)
                l.push(new GraceNum(i));
            return new GraceList(l);
        },
        "asNumber": function(argcv) {
            return new GraceNum(+this._value);
        },
        "match": function(argcv, o) {
            if (Grace_isTrue(callmethod(this, "==", [1], o)))
                return new GraceSuccessfulMatch(o);
            return new GraceFailedMatch(o);
        },
        "|": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "&": function(argcv, o) {
            return new GraceAndPattern(this, o);
        },
        "asDebugString": function(argcv) {
            return new GraceString("\"" + this._value + "\"");
        },
    },
    className: "String",
    definitionModule: "unknown",
    definitionLine: 0,
};
GraceString.prototype.methods["[]"] = GraceString.prototype.methods["at"];

function GraceRange(start, end, step) {
    this._start = start;
    this._end = end;
    this._step = step;
    this._cur = start;
}

GraceRange.prototype = {
    methods: {
        "asString": function(argcv) {
            return new GraceString("Range[" + this._start + ".." +
                    this._end + ".." + this._step + "]");
        },
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "..": function(argcv, newstep) {
            var ns = newstep._value;
            return new GraceRange(this._start, this._end, ns);
        },
        "havemore": function() {
            return new GraceBoolean(this._step > 0 ? this._cur <= this._end
                    : this._cur >= this._end);
        },
        "next": function() {
            var rv = new GraceNum(this._cur);
            this._cur += this._step;
            return rv;
        },
        "iterator": function() {
            return this;
        },
    },
    className: "Range",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceNum(n) {
    this._value = n;
}

GraceNum.prototype = {
    methods: {
        "+": function(argcv, other) {
            var s = this._value + other._value;
            return new GraceNum(s)
        },
        "*": function(argcv, other) {
            var s = this._value * other._value;
            return new GraceNum(s)
        },
        "/": function(argcv, other) {
            var s = this._value / other._value;
            return new GraceNum(s)
        },
        "-": function(argcv, other) {
            var s = this._value - other._value;
            return new GraceNum(s)
        },
        "^": function(argcv, other) {
            var s = Math.pow(this._value, other._value);
            return new GraceNum(s)
        },
        "%": function(argcv, other) {
            var s = this._value % other._value;
            return new GraceNum(s)
        },
        "++": function(argcv, other) {
            var t = callmethod(this, "asString", [0]);
            return callmethod(t, "++", [1], other);
        },
        "..": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            var ub = parseInt(o._value);
            return new GraceRange(this._value, ub, 1);
        },
        "<": function(argcv, other) {
            var s = this._value < other._value;
            return new GraceBoolean(s)
        },
        ">": function(argcv, other) {
            var s = this._value > other._value;
            return new GraceBoolean(s)
        },
        "<=": function(argcv, other) {
            var s = this._value <= other._value;
            return new GraceBoolean(s)
        },
        ">=": function(argcv, other) {
            var s = this._value >= other._value;
            return new GraceBoolean(s)
        },
        "prefix-": function(argcv) {
            return new GraceNum(-this._value)
        },
        "asString": function(argcv) {
            return new GraceString("" + this._value)
        },
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            if (this.className == other.className
                    && this._value == other._value)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "/=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "hashcode": function(argcv) {
            return new GraceNum(parseInt("" + (this._value * 10)));
        },
        "inBase": function(argcv, other) {
            var mine = this._value;
            var base = other._value;
            var symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
            var str = "";
            var before = "";
            if (mine < 0) {
                before = '-';
                mine = -mine;
            }
            while (mine != 0) {
                var r = mine % base;
                str = symbols[r] + str;
                mine = (mine - r) / base;
            }
            if (before)
                str = before + str;
            return new GraceString(str);
        },
        "truncate": function(argcv) {
            if (this._value < 0)
                return new GraceNum(Math.ceil(this._value));
            return new GraceNum(Math.floor(this._value));
        },
        "match": function(argcv, o) {
            if (Grace_isTrue(callmethod(this, "==", [1], o)))
                return new GraceSuccessfulMatch(o);
            return new GraceFailedMatch(o);
        },
        "|": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "&": function(argcv, o) {
            return new GraceAndPattern(this, o);
        },
        "asDebugString": function(argcv) {
            return new GraceString("" + this._value);
        },
    },
    className: "Number",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceBoolean(b) {
    this._value = b;
}
GraceBoolean.prototype = {
    methods: {
        "not": function(argcv) {
            return new GraceBoolean(!this._value)
        },
        "prefix!": function(argcv) {
            return new GraceBoolean(!this._value)
        },
        "&": function(argcv, other) {
            return new GraceAndPattern(this, other);
        },
        "|": function(argcv, other) {
            return new GraceOrPattern(this, other);
        },
        "&&": function(argcv, other) {
            if (!this._value)
                return this;
            if (other instanceof GraceBoolean)
                return other;
            if (other.superobj instanceof GraceBoolean)
                return other;
            var o = callmethod(other, "apply", [0]);
            return o;
        },
        "||": function(argcv, other) {
            if (this._value)
                return this;
            if (other instanceof GraceBoolean)
                return other;
            if (other.superobj instanceof GraceBoolean)
                return other;
            var o = callmethod(other, "apply", [0]);
            return o;
        },
        "andAlso": function(argcv, other) {
            if (this._value) {
                return callmethod(other, "apply", [0]);
            }
            return this;
        },
        "orElse": function(argcv, other) {
            if (!this._value) {
                return callmethod(other, "apply", [0]);
            }
            return this;
        },
        "asString": function(argcv) {
            return new GraceString("" + this._value)
        },
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            if (this.prototype == other.prototype
                    && this._value == other._value)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "/=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "match": function(argcv, o) {
            if (Grace_isTrue(callmethod(this, "==", [1], o)))
                return new GraceSuccessfulMatch(o);
            return new GraceFailedMatch(o);
        },
        "asDebugString": function(argcv) {
            return new GraceString("" + this._value);
        },
    },
    className: "Boolean",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceList(l) {
    this._value = l;
}
GraceList.prototype = {
    methods: {
        "push": function(argcv, val) {
            this._value.push(val);
            return var_done;
        },
        "size": function(argcv) {
            //dbg("called size: " + this._value.length);
            return new GraceNum(this._value.length);
        },
        "pop": function(argcv) {
            return this._value.pop();
        },
        "at": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            var idx = parseInt(o._value);
            return this._value[idx-1];
        },
        "[]": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            var idx = parseInt(o._value);
            return this._value[idx-1];
        },
        "at()put": function(argcv, idx, val) {
            this._value[idx._value-1] = val;
            return var_done;
        },
        "[]:=": function(argcv, idx, val) {
            this._value[idx._value-1] = val;
            return var_done;
        },
        "asString": function(argcv) {
            var s = "[";
            for (var i=0; i<this._value.length; i++) {
                var v = this._value[i];
                if (v.methods["asString"])
                    s += callmethod(v, "asString", [0])._value + ", ";
                else {
                    var q = dbgp(v, 2);
                    s += "((" + q + ")), "
                }
            }
            s += "]";
            return new GraceString(s.replace(", ]", "]"));
        },
        "contains": function(argcv, other) {
            for (var i=0; i<this._value.length; i++) {
                var v = this._value[i];
                if (Grace_isTrue(callmethod(v, "==", [1], other)))
                    return new GraceBoolean(true);
            }
            return new GraceBoolean(false);
        },
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "/=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "prepended": function(argcv, item) {
            var l = [item];
            for (var i=0; i<this._value.length; i++)
                l.push(this._value[i]);
            return new GraceList(l);
        },
        "iterator": function(argcv) {
            return new GraceListIterator(this._value);
        },
        "indices": function(argcv) {
            var l = [];
            for (var i=1; i<=this._value.length; i++)
                l.push(new GraceNum(i));
            return new GraceList(l);
        },
        "first": function(argcv) {
            return this._value[0];
        },
        "last": function(argcv) {
            return this._value[this._value.length-1];
        },
        "reduce": function(argcv, initial, block) {
            var res = initial
            for (var i=0; i<this._value.length; i++) {
                var v = this._value[i];
                res = callmethod(block, "apply", [2], res, v)
            }
            return res;
        },
        "asDebugString": function(argcv) {
            return callmethod(this, "asString", [0]);
        },
        "++": function(argcv, other) {
            var l = this._value.concat(other._value);
            return new GraceList(l);
        }
    },
    className: "List",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GracePrimitiveArray(n) {
    this._value = [];
    for (var i=0; i<n; i++)
        this._value.push(var_done);
}
GracePrimitiveArray.prototype = {
    methods: {
        "size": function(argcv) {
            //dbg("called size: " + this._value.length);
            return new GraceNum(this._value.length);
        },
        "at": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            var idx = parseInt(o._value);
            return this._value[idx];
        },
        "[]": function(argcv, other) {
            var o = callmethod(other, "asString", [0]);
            var idx = parseInt(o._value);
            return this._value[idx];
        },
        "at()put": function(argcv, idx, val) {
            this._value[idx._value] = val;
            return var_done;
        },
        "[]:=": function(argcv, idx, val) {
            this._value[idx._value] = val;
            return var_done;
        },
        "asString": function(argcv) {
            var s = "[";
            s += this._value.length + ": "
            for (var i=0; i<this._value.length; i++) {
                var v = this._value[i];
                if (v.methods["asString"])
                    s += callmethod(v, "asString", [0])._value + ", ";
                else {
                    var q = dbgp(v, 2);
                    s += "((" + q + ")), "
                }
            }
            s += "]";
            return new GraceString(s);
        },
        "contains": function(argcv, other) {
            for (var i=0; i<this._value.length; i++) {
                var v = this._value[i];
                if (Grace_isTrue(callmethod(v, "==", [1], other)))
                    return new GraceBoolean(true);
            }
            return new GraceBoolean(false);
        },
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "iterator": function(argcv) {
            return new GracePrimitiveArrayIterator(this._value);
        },
        "asDebugString": function(argcv) {
            return callmethod(this, "asString", [0]);
        },
    },
    className: "PrimitiveArray",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceOrPattern(l, r) {
    this._left = l;
    this._right = r;
}
GraceOrPattern.prototype = {
    methods: {
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "match": function(argcv, o) {
            var m1 = callmethod(this._left, "match", [1], o);
            if (Grace_isTrue(m1))
                return new GraceSuccessfulMatch(o);
            var m2 = callmethod(this._right, "match", [1], o);
            if (Grace_isTrue(m2))
                return new GraceSuccessfulMatch(o);
            return new GraceFailedMatch(o);
        },
        "|": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "&": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "asString": function(argcv) {
            return new GraceString("<OrPattern("
                    + callmethod(this._left, "asString", [0])._value
                    + ", " + callmethod(this._right, "asString", [0])._value
                    + ")>");
        },
        "asDebugString": function(argcv) {
            return callmethod(this, "asString", [0]);
        },
    },
    className: "OrPattern",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceAndPattern(l, r) {
    this._left = l;
    this._right = r;
}
GraceAndPattern.prototype = {
    methods: {
        "==": function(argcv, other) {
            if (this == other)
                return new GraceBoolean(true);
            return new GraceBoolean(false);
        },
        "!=": function(argcv, other) {
            var t = callmethod(this, "==", [1], other);
            return callmethod(t, "not", [0]);
        },
        "match": function(argcv, o) {
            var m1 = callmethod(this._left, "match", [1], o);
            if (!Grace_isTrue(m1))
                return m1;
            var m2 = callmethod(this._right, "match", [1], o);
            if (!Grace_isTrue(m1))
                return m2;
            var lb = callmethod(m1, "bindings", [0])._value;
            var rb = callmethod(m2, "bindings", [0])._value;
            return new GraceSuccessfulMatch(o, new GraceList(lb.concat(rb)));
        },
        "|": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "&": function(argcv, o) {
            return new GraceAndPattern(this, o);
        },
        "asString": function(argcv) {
            return new GraceString("<AndPattern("
                    + callmethod(this._left, "asString", [0])._value
                    + ", " + callmethod(this._right, "asString", [0])._value
                    + ")>");
        },
        "asDebugString": function(argcv) {
            return callmethod(this, "asString", [0]);
        },
    },
    className: "AndPattern",
    definitionModule: "unknown",
    definitionLine: 0,
};

function Grace_isTrue(o) {
    if (o._value === false)
        return false;
    if (o._value === true)
        return true;
    if (o.superobj != null)
        return Grace_isTrue(o.superobj);
}

function Grace_egal(o1, o2) {
    if (o1 == o2)
        return new GraceBoolean(true);
    if (o1.mutable || o2.mutable)
        return new GraceBoolean(false);
    var t1 = classType(o1);
    var t2 = classType(o2);
    var tm = callmethod(callmethod(t1, "match", [1], o2),
            "&&", [1], callmethod(t2, "match", [1], o1));
    if (!Grace_isTrue(tm))
        return new GraceBoolean(false);
    for (d in o1.methods) {
        if (d == "outer")
            continue;
        var meth = o1.methods[d];
        var tmp = o2;
        while (tmp != null && tmp != undefined
                && typeof(tmp.methods[d]) != "function")
            tmp = tmp.superobj;
        if (tmp == null || tmp == undefined)
            return new GraceBoolean(false);
        if (meth == tmp.methods[d])
            continue;
        if (meth.def && !tmp.methods[d].def)
            return new GraceBoolean(false);
        if (!meth.def && meth != tmp.methods[d])
            return new GraceBoolean(false);
        if (o1.data[d] && !tmp.data[d])
            return new GraceBoolean(false);
        var leftdata = o1.data[d];
        var rightdata = tmp.data[d];
        if (!Grace_isTrue(callmethod(leftdata, "==", [1], rightdata)))
            return new GraceBoolean(false);
    }
    return new GraceBoolean(true);
}

function Grace_print(obj) {
    var s = callmethod(obj, "asString", [0]);
    minigrace.stdout_write(s._value + "\n");
    return var_done;
}

function Grace_length(obj) {
    return new GraceNum(obj._value.length);
}

function GraceObject() {

}
GraceObject.prototype = {
    methods: {
        "==": function(argcv, o) {
            return new GraceBoolean(this == o);
        },
        "!=": function(argcv, o) {
            var b = this.methods["=="].call(this, o);
            return b.methods["not"].call(b);
        },
        "/=": function(argcv, o) {
            var b = this.methods["=="].call(this, o);
            return b.methods["not"].call(b);
        },
        "asDebugString": function(argcv) {
            return this.methods.asString();
        },
        "asString": function(argcv) {
            var s = "object {";
            for (var i in this.data) {
                try {
                    s += "" + i + " = " + callmethod(this.data[i], "asDebugString", [0])._value + "; ";
                } catch (e) {
                    s += "var " + i + ";"
                }
            }
            return new GraceString(s + "}");
        },
    },
    data: {}
};

GraceObjectMethods = {
    "==": function(argcv, o) {
        return Grace_egal(this, o);
    },
    "!=": function(argcv, other) {
        var t = callmethod(this, "==", [1], other);
        return callmethod(t, "not", [0]);
    },
    "/=": function(argcv, other) {
        var t = callmethod(this, "==", [1], other);
        return callmethod(t, "not", [0]);
    },
    "asString": function(argcv) {
        var s = "object(";
        s += this.definitionModule + ":" + this.definitionLine;
        s += ") {";
        for (var i in this.data) {
            try {
                s += "" + i + " = " + callmethod(this.data[i], "asDebugString", [0])._value + "; ";
            } catch (e) {
                s += "var " + i + ";"
            }
        }
        return new GraceString(s + "}");
    },
};

function Grace_allocObject() {
    return {
        methods: {
            "==": GraceObjectMethods["=="],
            "!=": GraceObjectMethods["!="],
            "asDebugString": GraceObjectMethods["asString"],
            "asString": GraceObjectMethods["asString"],
        },
        superobj: null,
        data: {},
        className: "Object",
        mutable: false,
        definitionModule: "unknown",
        definitionLine: 0,
    };
}

function GraceMatchResult(result, bindings) {
    this.data["result"] = result;
    if (bindings == undefined)
        bindings = new GraceList([]);
    this.data["bindings"] = bindings;
    this._value = this.superobj._value;
}
GraceMatchResult.prototype = Grace_allocObject();
GraceMatchResult.prototype.methods.result = function() {
    return this.data["result"];
}
GraceMatchResult.prototype.methods.bindings = function() {
    return this.data["bindings"];
}
GraceMatchResult.prototype.methods.asString = function() {
    var s = ""
    if (Grace_isTrue(this))
        s = "SuccessfulMatch(result = ";
    else
        s = "FailedMatch(result = ";
    s += callmethod(this.data["result"], "asString", [0])._value;
    s += ", bindings = ";
    s += callmethod(this.data["bindings"], "asString", [0])._value;
    s += ")";
    return new GraceString(s);
}

function GraceSuccessfulMatch(result, bindings) {
    this.superobj = new GraceBoolean(true);
    this.data = {};
    this.data["result"] = result;
    if (bindings == undefined)
        bindings = new GraceList([]);
    this.data["bindings"] = bindings;
    this._value = this.superobj._value;
}
GraceSuccessfulMatch.prototype = GraceMatchResult.prototype;

function GraceFailedMatch(result, bindings) {
    this.superobj = new GraceBoolean(false);
    this.data = {};
    this.data["result"] = result;
    if (bindings == undefined)
        bindings = new GraceList([]);
    this.data["bindings"] = bindings;
    this._value = this.superobj._value;
}
GraceFailedMatch.prototype = GraceMatchResult.prototype;

function GraceType(name) {
    this.name = name;
    this.className = name;
    this.typeMethods = [];
}
GraceType.prototype = {
    methods: {
        "match": function(argcv, other) {
            var i;
            for (i=0; i<this.typeMethods.length; i++) {
                var m = this.typeMethods[i];
                if (!other.methods[m]) {
                    var tmp = other;
                    var found = false;
                    while (tmp.superobj != null) {
                        tmp = tmp.superobj;
                        if (tmp.methods[m]) {
                            found = true;
                            break
                        }
                    }
                    if (!found)
                        return new GraceFailedMatch(other);
                }
            }
            return new GraceSuccessfulMatch(other,
                    new GraceList([]));
        },
        "|": function(argcv, other) {
            return new GraceOrPattern(this, other);
        },
        "&": function(argcv, other) {
            return new GraceAndPattern(this, other);
        },
        "asString": function(argcv) {
            return new GraceString("Type<" + this.name + ">");
        }
    },
    typeMethods: [],
    className: "Type",
    definitionModule: "unknown",
    definitionLine: 0,
};

function GraceBlock_match(argcv, o) {
    if (!this.pattern) {
        if (argcv.length != 1 || argcv[0] != 1) {
            throw new GraceExceptionPacket(RuntimeErrorObject,
                    new GraceString("Block is not a matching block"));
        }
        var rv = callmethod(this, "apply", [1], o);
        return new GraceSuccessfulMatch(rv);
    }
    var match = callmethod(this.pattern, "match", [1], o);
    if (Grace_isTrue(match)) {
        var bindings = callmethod(match, "bindings", [0]);
        var rv = callmethod(this, "applyIndirectly", [1], bindings);
        return new GraceSuccessfulMatch(rv);
    }
    return new GraceFailedMatch(o);
}

function GraceLiftedBlock(of) {
    this.block = of;
}

GraceLiftedBlock.prototype = Grace_allocObject();
GraceLiftedBlock.prototype.methods['match'] = function(argcv, o) {
    var mr = callmethod(this.block, "match", [1], o);
    if (!Grace_isTrue(mr))
        return new GraceFailedMatch(o);
    var result = callmethod(mr, "result", [0]);
    if (Grace_isTrue(result))
        return new GraceSuccessfulMatch(o);
    return new GraceFailedMatch(o);
};
GraceLiftedBlock.prototype.methods["|"] = function(argcv, o) {
    return new GraceOrPattern(this, o);
};
GraceLiftedBlock.prototype.methods["&"] = function(argcv, o) {
    return new GraceAndPattern(this, o);
};

function GraceBlock_lift(argcv, o) {
    return new GraceLiftedBlock(this);
}

function classType(obj) {
    var t = new GraceType(obj.className);
    var o = obj;
    while (o != null) {
        var i;
        for (m in o.methods)
            t.typeMethods.push(m);
        o = o.superobj;
    }
    return t;
}

var var_Unknown = new GraceType("Unknown");
var var_Dynamic = var_Unknown;
var var_Done = new GraceType("Done");
var var_String = classType(new GraceString(""));
var var_Number = classType(new GraceNum(1));
var var_Boolean = classType(new GraceBoolean(true));
var var_Type = classType(var_Boolean);
var var_List = new GraceType("List");
var_List.typeMethods = ["==", "!=", "push", "pop", "at", "at()put",
    "[]", "[]:=", "size", "iterator", "++", "asString", "asDebugString"];
var type_String = var_String;
var type_Number = var_Number;
var type_Boolean = var_Boolean;
var type_Unknown = var_Unknown;
var type_Dynamic = var_Dynamic;
var type_List = var_List;
var var_Block = new GraceType("Block");
var_Block.typeMethods.push("apply");
var_Block.typeMethods.push("applyIndirectly");
var_Block.typeMethods.push("match");
var type_Block = var_Block;
var var_None = new GraceType("None");
var_None.typeMethods.push("==");
var_None.typeMethods.push("!=");
var type_None = var_None;
var var_Void = var_None;
var type_Void = var_None;
var var_MatchFailed = Grace_allocObject();
var_HashMap = { methods: { 'new': function() { return new GraceHashMap(); } } };

function GraceHashMap() {
    this.table = {};
    this.size = 0;
}
GraceHashMap.prototype = Grace_allocObject();
GraceHashMap.prototype.methods.put = function(argcv, k, v) {
    var hc = callmethod(k, "hashcode", [0]);
    hc = hc._value;
    while (this.table[hc]) {
        if (Grace_isTrue(callmethod(this.table[hc].key, "==", [1], k)))
            break;
        hc++;
    }
    this.size++;
    this.table[hc] = {key: k, value: v};
    return this;
}
GraceHashMap.prototype.methods.get = function(argcv, k) {
    var hc = callmethod(k, "hashcode", [0]);
    hc = hc._value;
    while (this.table[hc]) {
        if (Grace_isTrue(callmethod(this.table[hc].key, "==", [1], k)))
            return this.table[hc].value;
        hc++;
    }
    throw new GraceExceptionPacket(RuntimeErrorObject,
            new GraceString("Key not found in HashMap"));
}
GraceHashMap.prototype.methods.contains = function(argcv, k) {
    var hc = callmethod(k, "hashcode", [0]);
    hc = hc._value;
    while (this.table[hc]) {
        if (Grace_isTrue(callmethod(this.table[hc].key, "==", [1], k)))
            return new GraceBoolean(true);
        hc++;
    }
    return new GraceBoolean(false);
}
GraceHashMap.prototype.methods.asString = function() {
    var s = "[{";
    var first = true;
    for (h in this.table) {
        p = this.table[h];
        if (first)
            first = false;
        else
            s += ", ";
        s += callmethod(p.key, "asString", [0])._value;
        s += ": ";
        s += callmethod(p.value, "asString", [0])._value;
    }
    s += "}]";
    return new GraceString(s);
}
GraceHashMap.prototype.methods.asDebugString = GraceHashMap.prototype.methods.asString;

function GraceListIterator(l) {
    this._value = l;
    this._index = 0;
    this._max = l.length;
}
GraceListIterator.prototype = Grace_allocObject();
GraceListIterator.prototype.methods.havemore = function() {
    return new GraceBoolean(this._index < this._max);
}
GraceListIterator.prototype.methods.next = function() {
    var rv = this._value[this._index];
    this._index++;
    return rv;
}

function GraceStringIterator(s) {
    this._value = s._value;
    this._index = 0;
    this._max = s._value.length;
}
GraceStringIterator.prototype = Grace_allocObject();
GraceStringIterator.prototype.methods.havemore = function() {
    return new GraceBoolean(this._index < this._max);
}
GraceStringIterator.prototype.methods.next = function() {
    var rv = new GraceString(this._value.charAt(this._index));
    this._index++;
    return rv;
}

var stdout = Grace_allocObject();
stdout.methods.write = function(junk, s) {
    minigrace.stdout_write(s._value);
}
stdout.methods.close = function() {};

var stdin = Grace_allocObject();
stdin.methods.read = function() {
    return new GraceString(minigrace.stdin_read());
}
stdin.methods.iterator = function() {
    return callmethod(new GraceString(minigrace.stdin_read()), "iterator", [0]);
}
stdin.methods.close = function() {};

var stderr = Grace_allocObject();
stderr.methods.write = function(junk, s) {
    minigrace.stderr_write(s._value);
    return var_done;
}
stderr.methods.close = function() {};

var gctCache = {};
var originalSourceLines = {};
var stackFrames = [];

function StackFrame(methodName) {
    this.methodName = methodName;
    this.variables = {};
}
StackFrame.prototype = {
    addVar: function(name, accessor) {
        this.variables[name] = accessor;
        return var_done;
    },
    getVar: function(name) {
        return this.variables[name]();
    },
    forEach: function(f) {
        for (var v in this.variables)
            f(v, this.getVar(v));
        return var_done;
    },
};

function gracecode_io() {
    this.methods.output = function() {
        return this._output;
    };
    this._output = stdout;
    this.methods.input = function() {
        return this._input;
    };
    this._input = stdin;
    this.methods.error = function() {
        return this._error;
    };
    this._error = stderr;
    this.methods.exists = function(argcv, path) {
        path = path._value;
        var gctpath = path.substr(0, path.length - 4);
        if (gctCache[gctpath])
            return new GraceBoolean(true);
        return new GraceBoolean(false);
    }
    this.methods.open = function(argcv, path, mode) {
        var o = new GraceObject();
        o.methods['write'] = function() {};
        o.methods['close'] = function() {};
        path = path._value;
        if (path.substr(path.length - 4) == ".gct") {
            var gctpath = path.substr(0, path.length - 4);
            if (mode._value == "w")
                gctCache[gctpath] = "";
            else if (mode._value == "r") {
                o._lines = gctCache[gctpath].split("\n");
                o._index = 0;
            }
            o.methods['write'] = function(argcv, s) {
                gctCache[gctpath] += s._value;
            }
            o.methods['getline'] = function(argcv) {
                return new GraceString(this._lines[this._index++]);
            }
            o.methods['eof'] = function() {
                return new GraceBoolean(this._index >= this._lines.length);
            }
        }
        return o;
    };
    this.methods.realpath = function(junk, x) {
        return x;
    };
    this.methods.findResource = function(junk, path) {
        return path;
    }
    this.definitionModule = "io";
    this.definitionLine = 0;
    return this;
}

function gracecode_sys() {
    this.methods.argv = function() {
        return new GraceList([
            new GraceString("minigrace"),
            new GraceString("--target"),
            new GraceString("js"),
        ]);
    };
    this.methods.exit = function() {
        throw "SystemExit";
    };
    this.methods.execPath = function() {
        return new GraceString("./minigrace");
    };
    this.methods.environ = function() {
        var o = new GraceObject();
        o.methods['at'] = function() {return new GraceString("");};
        o.methods['[]'] = o.methods['at'];
        o.methods['at()put'] = function() {return new GraceBoolean(true);};
        o.methods['[]:='] = o.methods['at()put'];
        o.methods['contains'] = function() {return new GraceBoolean(false);};
        return o;
    };
    this.definitionModule = "sys";
    this.definitionLine = 0;
    return this;
}

function gracecode_imports() {
    var extensions = {
        'txt': Grace_allocObject(),
    };
    extensions.txt.methods.loadResource = function(junk, path) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://' + path._value, false);
        req.send(null);
        if (req.status == 200) {
            return new GraceString(req.responseText);
        }
        throw new GraceExceptionPacket(RuntimeErrorObject,
                new GraceString("Error loading resource '" + path._value
                    + "'."));
    };
    this.methods.registerExtension = function(junk, ext, handler) {
        extensions[ext._value] = handler;
    };
    this.methods.loadResource = function(junk, importpath) {
        path = importpath._value;
        var slashPos = path.lastIndexOf('/');
        var dotpos = path.indexOf('.', slashPos);
        if (dotpos <= 0)
            throw new GraceExceptionPacket(RuntimeErrorObject,
                    new GraceString("No extension in path '" + path._value
                        + "'."));
        var ext = path.substr(dotpos + 1);
        if (extensions[ext]) {
            return callmethod(extensions[ext], "loadResource", [1], importpath);
        }
        throw new GraceExceptionPacket(RuntimeErrorObject,
                new GraceString("No mapping for extension '" + ext + "'."));
    };
    this.definitionModule = "imports";
    this.definitionLine = 0;
    return this;
}

function gracecode_unicode() {
    this.methods = {
        isLetter: function(argcv, s) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, "Ll")
                    || unicode.isCategory(s, "Lu")
                    || unicode.isCategory(s, "Lo")
                    || unicode.isCategory(s, "Lm"));
        },
        isNumber: function(argcv, s) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, "Nd")
                    || unicode.isCategory(s, "No")
                    || unicode.isCategory(s, "Nl"));
        },
        isSymbolMathematical: function(argcv, s) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, "Sm"));
        },
        isSeparator: function(argcv, s) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, "Zs")
                    || unicode.isCategory(s, "Zp")
                    || unicode.isCategory(s, "Zl"));
        },
        isControl: function(argcv, s) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, "Cf")
                    || unicode.isCategory(s, "Cc")
                    || unicode.isCategory(s, "Co")
                    || unicode.isCategory(s, "Cs"));
        },
        iscategory: function(argcv, s, c) {
            if (typeof s._value == "number")
                s = String.fromCharCode(s._value);
            else s = s._value;
            return new GraceBoolean(unicode.isCategory(s, c._value));
        },
        name: function(argcv, s) {
            return new GraceString(unicode.name(s._value));
        },
        create: function(argcv, n) {
            return new GraceString(String.fromCharCode(n._value));
        },
        pattern: function(argcv) {
            var args = Array.prototype.slice.call(arguments, 1);
            return new GraceUnicodePattern(args);
        },
        "pattern()not": function(argcv) {
            var args = Array.prototype.slice.call(arguments, 1, argcv[0] + 1);
            var args2 = Array.prototype.slice.call(arguments, argcv[0] + 1);
            return new GraceUnicodePattern(args, args2);
        },
    };
    this.definitionModule = "unicode";
    this.definitionLine = 0;
    return this;
}

function GraceUnicodePattern(pos, neg) {
    this.pos = pos;
    this.neg = neg;
}

GraceUnicodePattern.prototype = {
    methods: {
        match: function(argcv, o) {
            var success = false;
            var cc = o._value;
            if (cc.charCodeAt)
                cc = cc.charCodeAt(0);
            for (var i=0; i<this.pos.length; i++) {
                var t = this.pos[i];
                if (typeof t._value == "number") {
                    if (cc == t._value) {
                        success = true;
                        break;
                    }
                } else {
                    if (unicode.isCategory(cc, t._value)) {
                        success = true;
                        break;
                    }
                }
            }
            if (this.neg) {
                if (this.pos.length == 0)
                    success = true;
                for (var i=0; i<this.neg.length; i++) {
                    var t = this.neg[i];
                    if (typeof t._value == "number") {
                        if (cc == t._value) {
                            success = false;
                            break;
                        }
                    } else {
                        if (unicode.isCategory(cc, t._value)) {
                            success = false;
                            break;
                        }
                    }
                }
            }
            if (success)
                return new GraceSuccessfulMatch(o);
            return new GraceFailedMatch(o);
        }
    }
};

var util_module = false;

function gracecode_util() {
    if (util_module != false)
        return util_module;
    this.methods = {
        outfile: function(argcv) {
            return stdout;
        },
        infile: function(argcv) {
            return stdin;
        },
        parseargs: function(argcv) {
            return var_done;
        },
        target: function(argcv) {
            return new GraceString(minigrace.mode);
        },
        modname: function(argcv) {
            return new GraceString(minigrace.modname);
        },
        setline: function(argcv, i) {
            lineNumber = i._value;
            this._linenum = i;
        },
        linenum: function(argcv) {
            return this._linenum;
        },
        linepos: function(argcv) {
            return this._linepos;
        },
        setPosition: function(argcv, l, p) {
            lineNumber = l._value;
            this._linenum = l;
            this._linepos = p;
            return var_done;
        },
        buildtype: function(argcv) {
            return new GraceString("normal");
        },
        runmode: function(argcv) {
            return new GraceString("normal");
        },
        gracelibPath: function(argcv) {
            return new GraceString("gracelib.h");
        },
        verbosity: function(argcv) {
            return new GraceNum(30);
        },
        log_verbose: function(argcv, s) {
            if (minigrace.verbose)
                minigrace.stderr_write("minigrace: " + minigrace.modname + ': ' + s._value + "\n");
            return var_done;
        },
        outprint: function(argcv, s) {
            minigrace.stdout_write(s._value + "\n");
            return var_done;
        },
        engine: function(argcv) {
            return new GraceString("js");
        },
        debug: function(argcv, s) {
            dbg(s._value);
            return var_done;
        },
        interactive: function(argcv) {
            return new GraceBoolean(false);
        },
        type_error: function(argcv, s) {
            minigrace.stderr_write(minigrace.modname + ".grace:" + this._linenum._value + ":" +
                this._linepos._value + ": type error: " + s._value + "\n");
            throw "ErrorExit";
        },
        // This is called by various wrapper methods in the errormessages module.
        // The parameters are explained as follows:
        // - message: The text of the error message.
        // - errlinenum: The line number on which the error occurred.
        // - position: A string used to show the position of the error in the error message.
        // - arr: The string used to draw an arrow showing the position of the error.
        // - spacePos: The position in the error line that a space should be inserted, or false.
        // - suggestions: A (possibly empty) list of suggestions to correct the error.
        "syntaxError": function(argcv, message, errlinenum, position, arr, spacePos, suggestions) {
            callmethod(this, "generalError", [6], new GraceString("Syntax error: " + message._value), errlinenum,
                position, arr, spacePos, suggestions);
        },
        "generalError": function(argcv, message, errlinenum, position, arr, spacePos, suggestions) {
            minigrace.stderr_write(minigrace.modname + ".grace[" + errlinenum._value + position._value
                + "]: " + message._value + "\n");

            if ((errlinenum._value > 1) && (callmethod(this._lines, "size", [0])._value > 1))
                minigrace.stderr_write("  " + (errlinenum._value - 1) + ": "
                    + callmethod(this._lines, "at",
                        [1], new GraceNum(errlinenum._value - 1))._value + "\n");

            if (callmethod(this._lines, "size", [0])._value >= errlinenum._value) {
                var line = callmethod(this._lines, "at", [1], new GraceNum(errlinenum._value))._value;
                if(spacePos._value != false) {
                    minigrace.stderr_write("  " + errlinenum._value + ": " + line.substring(0, spacePos._value - 1) + " "
                        + line.substring(spacePos._value - 1) + "\n");
                } else {
                    minigrace.stderr_write("  " + errlinenum._value + ": " + line + "\n");
                }
                minigrace.stderr_write(arr._value + "\n");
            }

            if (errlinenum._value <
                    callmethod(this._lines, "size", [0])._value)
                minigrace.stderr_write("  " + (errlinenum._value + 1) + ": "
                    + callmethod(this._lines, "at",
                        [1], new GraceNum(errlinenum._value + 1))._value + "\n");

            var numsuggestions = callmethod(suggestions, "size", []);
            if(numsuggestions._value > 0) {
                for(var i=1; i <= numsuggestions._value; i++) {
                    minigrace.stderr_write("\nDid you mean:\n");
                    var suggestion = callmethod(suggestions, "at", [1], new GraceNum(i));
                    callmethod(suggestion, "print", [0]);
                }
            }

            throw "ErrorExit";
        },
        semantic_error: function(argcv, s) {
            minigrace.stderr_write(minigrace.modname + ".grace:" + this._linenum._value + ":" +
                this._linepos._value + ": semantic error: " + s._value + "\n");
            if (this._linenum._value > 1)
                minigrace.stderr_write("  " + (this._linenum._value - 1) + ": "
                    + callmethod(this._lines, "at",
                        [1], new GraceNum(this._linenum._value - 1))._value
                    + "\n");
            var linenumsize = callmethod(callmethod(this._linenum, "asString", []), "size", []);
            var arr = "----";
            for (var i=1; i<this._linepos._value+linenumsize._value; i++)
                arr = arr + "-";
            minigrace.stderr_write("  " + this._linenum._value + ": "
                + callmethod(this._lines, "at",
                        [1], new GraceNum(this._linenum._value))._value + "\n");
            minigrace.stderr_write(arr + "^\n");
            if (this._linenum._value <
                    callmethod(this._lines, "size", [])._value)
                minigrace.stderr_write("  " + (this._linenum._value + 1) + ": "
                    + callmethod(this._lines, "at",
                        [1], new GraceNum(this._linenum._value + 1))._value
                    + "\n");
            throw "ErrorExit";
        },
        warning: function(argcv, s) {
            minigrace.stderr_write(minigrace.modname + ".grace:" + this._linenum._value + ":" +
                this._linepos._value + ": warning: " + s._value + "\n");
        },
        hex: function(argcv, n) {
            var hexdigits = "0123456789abcdef"
            var s = ""
            var num = n._value
            while (num > 0) {
                var i = num % 16
                s = hexdigits.charAt(i) + s
                num = num - i
                num = num / 16
            }
            return new GraceString(s)
        },
        join: function(argcv, joiner, iterable) {
            var s = "";
            var ind = callmethod(iterable, "indices", [0]);
            for (var i=0; i<ind._value.length; i++) {
                if (i > 0)
                    s += ",";
                s += callmethod(callmethod(iterable, "at", [1], new GraceNum(i + 1)),
                        "asString", [0])._value;
            }
            return new GraceString(s);
        },
        split: function(argcv, str, by) {
            var r = [];
            var pts = str._value.split(by);
            for (var i=0; i<pts.length; i++)
                r.push(new GraceString(pts[i]));
            return new GraceList(pts);
        },
        "runOnNew()else": function(argcv, b,e) {
            return callmethod(b, "apply", [0]);
        },
        "extensions": function(argcv) {
            return extensionsMap;
        },
        "processExtension": function(argcv, ext) {
            var extn;
            var extv;
            ext = ext._value;
            if (ext.indexOf("=") >= 0) {
                var tmp = ext.split("=");
                extn = new GraceString(tmp[0]);
                extv = new GraceString(tmp[1]);
            } else {
                extn = new GraceString(ext);
                extv = new GraceBoolean(true);
            }
            callmethod(extensionsMap, "put", [2], extn, extv);
            return var_done;
        },
        "lines": function(argcv) {
            return this._lines;
        },
        "cLines": function(argcv) {
            return this._cLines;
        },
        "lines:=": function(argcv, v) {
            this._lines = v;
            return var_done;
        },
        "cLines:=": function(argcv, v) {
            this._cLines = v;
            return var_done;
        },
        "suggestion": function() {
            return this._suggestion;
        },
    };
    this._linenum = new GraceNum(1);
    this._linepos = new GraceNum(1);
    this._lines = new GraceList([]);
    this._cLines = new GraceList([]);
    this._suggestion = new Grace_allocObject();

    this._suggestion.methods["new"] = function(argcv, line, code) {
        var suggestion = new Grace_allocObject();
        suggestion.methods["line"] = function() {
            return line;
        };
        suggestion.methods["code"] = function() {
            return code;
        };
        return suggestion;
    };

    util_module = this;
    this.definitionModule = "util";
    this.definitionLine = 0;
    return this;
}

var interactive_module = false;
function gracecode_interactive() {
    return this;
}

function GraceMirrorMethod(o, k) {
    this.name = k;
    this.obj = o;
}
GraceMirrorMethod.prototype = Grace_allocObject();
GraceMirrorMethod.prototype.methods['name'] = function(argcv) {
    return new GraceString(this.name);
}
GraceMirrorMethod.prototype.methods['partcount'] = function(argcv) {
    var count = 1;
    var place = 1;
    while(place < this.name.length) {
        if(this.name[place] == "(") {
            count++;
            place++;
        }
        place++;
    }
    return new GraceNum(count);
}

GraceMirrorMethod.prototype.methods['paramcounts'] = function(argcv) {
    // the method metadata needed to populate the result is not yet available!
    return new GraceList([])
}

function alloc_Mirror(o) {
    var m = Grace_allocObject();
    m.methods['methods'] = function(argcv) {
        var k, meths = [];
        for (k in o.methods) {
            meths.push(new GraceMirrorMethod(o, k));
        }
        var l = new GraceList(meths);
        return l;
    }
    m.methods['getMethod'] = function(argcv, gString) {
        var k, name = gString._value;
        for (k in o.methods) {
            if (name == k) {
                return (new GraceMirrorMethod(o, k));
            }
        }
    }
    m.methods['annotations'] = function(argcv) {
        var annotations = [], i, l;
        for (i = 0, l = o.annotations.length; i < l; i++) {
            annotations.push(o.annotations[i]);
        }
        return new GraceList(annotations);
    }
    return m;
}

function gracecode_mirrors() {
    this.methods = {
        'loadDynamicModule': function(argcv, v) {
            return do_import(v._value, window["gracecode_" + v._value]);
        },
        'reflect': function(argcv, o) {
            return alloc_Mirror(o);
        }
    };
    this.definitionModule = "mirrors";
    this.definitionLine = 0;
    return this;
}

function gracecode_math() {
    this.methods = {
        'sin': function(argcv, value) {
            return new GraceNum(Math.sin(value));
        },
        'cos': function(argcv, value) {
            return new GraceNum(Math.cos(value));
        },
        'tan': function(argcv, value) {
            return new GraceNum(Math.tan(value));
        },
        'asin': function(argcv, value) {
            return new GraceNum(Math.asin(value));
        },
        'acos': function(argcv, value) {
            return new GraceNum(Math.acos(value));
        },
        'atan': function(argcv, value) {
            return new GraceNum(Math.atan(value));
        },
        'random': function(argcv) {
            return new GraceNum(Math.random());
        },
    };
    this.definitionModule = "math";
    this.definitionLine = 0;
    return this;
}

function checkmethodcall(func, methname, obj, args) {
    var i = 0;
    var pt = func.paramTypes;
    for (i=0; i<args.length, i<pt.length; i++) {
        var p = pt[i];
        if (!p || p.length == 0)
            continue;
        if (!args[i])
            continue;
        var t = p[0];
        if (!Grace_isTrue(callmethod(t, "match", [1], args[i]))) {
            throw new GraceExceptionPacket(RuntimeErrorObject,
                    new GraceString("Runtime type error: expected " + t.className + " for argument " + p[1] + " (" + (i+1) + ") of " + methname + "."));
        }
    }
}

var callStack = [];
var overrideReceiver = null;
var onSelf = false;
var onOuter = false;
var sourceObject;

function callmethodsuper(obj, methname, argcv) {
    overrideReceiver = obj;
    var args = Array.prototype.slice.call(arguments, 1);
    args.splice(0, 0, superDepth.superobj);
    onSelf = true;
    return callmethod.apply(null, args);
}

function callmethod(obj, methname, argcv) {
    if (typeof obj == 'undefined')
        throw new GraceExceptionPacket(RuntimeErrorObject,
                new GraceString("Requested method on uninitialised value "
                    + "around " + moduleName + ":" + lineNumber));;
    if (obj === undefined || !obj.methods)
        debugger
    var meth = obj.methods[methname];
    var origSuperDepth = superDepth;
    var isSuper = false;
    if (overrideReceiver != null)
        isSuper = true;
    superDepth = obj;
    var origModuleName = moduleName;
    if (typeof(meth) != "function") {
        var s = obj;
        isSuper = true;
        while (s.superobj != null) {
            s = s.superobj;
            meth = s.methods[methname];
            if (typeof(meth) == "function") {
                superDepth = s;
                break;
            }
        }
    }
    var objDesc = "";
    if (obj.definitionLine && obj.definitionModule != "unknown")
        objDesc = " in object at " + obj.definitionModule
            + ":" + obj.definitionLine;
    else if (obj.definitionModule != "unknown")
        objDesc = " in " + obj.definitionModule + " module";
    if (typeof(meth) != "function") {
        callStack.push(obj.className + "." + methname
                + " (defined nowhere"
                + objDesc + ")"
                + " at " + moduleName
                + ":" + lineNumber);
        throw new GraceExceptionPacket(RuntimeErrorObject,
                new GraceString("No such method '" + methname + "' on " +
                    obj.className + "."));;
    }
    if (meth.confidential && !onSelf) {
        throw new GraceExceptionPacket(RuntimeErrorObject,
                new GraceString("Requested confidential method '" + methname + "' on " + obj.className + " from outside."));
    }
    onSelf = false;
    onOuter = false;
    var oldSourceObject = sourceObject;
    sourceObject = superDepth;
    if (overrideReceiver != null) {
        obj = overrideReceiver;
        overrideReceiver = null;
    }
    var beforeSize = callStack.length;
    callStack.push(obj.className + "." + methname
            + " (defined at " + (meth.definitionModule ?
                    "" + meth.definitionModule + ":" + meth.definitionLine
                    : "unknown location")
            + objDesc + ")"
            + " at " + moduleName
            + ":" + lineNumber);
    var args = Array.prototype.slice.call(arguments, 3);
    for (var i=0; i<args.length; i++)
        if (typeof args[i] == 'undefined')
            throw new GraceExceptionPacket(RuntimeErrorObject,
                    new GraceString("Uninitialised value used as argument "
                        + "to " + methname + " "
                        + "around " + moduleName + ":" + lineNumber));;
    if (meth.paramTypes)
        checkmethodcall(meth, methname, obj, args);
    args.unshift(argcv)
    try {
        var ret = meth.apply(obj, args);
    } finally {
        superDepth = origSuperDepth;
        while (callStack.length > beforeSize)
            callStack.pop();
        sourceObject = oldSourceObject;
        moduleName = origModuleName;
    }
    return ret;
}

function catchCase(obj, cases, finallyblock) {
    var i = 0;
    try {
        callmethod(obj, "apply")
    } catch (e) {
        if (e.exctype == 'graceexception') {
            for (i = 0; i<cases.length; i++) {
                var ret = callmethod(cases[i], "match", [1],
                        e);
                if (Grace_isTrue(ret))
                    return var_done;
            }
            throw e;
        } else {
            throw e;
        }
    } finally {
        if (finallyblock != false)
            callmethod(finallyblock, "apply");
    }
    return var_done;
}

function matchCase(obj, cases, elsecase) {
    var i = 0;
    for (i = 0; i<cases.length; i++) {
        var ret = callmethod(cases[i], "match", [1], obj);
        if (Grace_isTrue(ret))
            return callmethod(ret, "result", [0]);
    }
    if (elsecase != false)
        return callmethod(elsecase, "apply", [1], obj);
    return new GraceFailedMatch(obj);
}

function ReturnException(v, target) {
    this.returnvalue = v;
    this.target = target;
}
ReturnException.prototype = {
    'exctype': 'return',
};

function GraceExceptionPacket(exception, message, data) {
    this.exception = exception;
    this.message = message;
    this.data = data;
    this.lineNumber = lineNumber;
    this.moduleName = moduleName;
    this.callStack = [];
    this.stackFrames = [];
    for (var i=0; i<callStack.length; i++)
        this.callStack.push(callStack[i]);
    for (var i=0; i<stackFrames.length; i++)
        this.stackFrames.push(stackFrames[i]);
}
GraceExceptionPacket.prototype = {
    methods: {
        "data": function(argcv) {
            return this.data;
        },
        "exception": function(argcv) {
            return this.exception;
        },
        "message": function(argcv) {
            return this.message;
        },
        "asString": function(argcv) {
            return new GraceString(this.exception.name + ": "
                    + this.message._value);
        }
    },
    exctype: 'graceexception'
};

function GraceException(name, par) {
    this.name = name;
    this.par = par;
}
GraceException.prototype = {
    methods: {
        "refine": function(argcv, nm) {
            return new GraceException(nm._value, this)
        },
        "raise": function(argcv, msg) {
            throw new GraceExceptionPacket(this, msg, new GraceObject())
        },
        "raiseWith": function(argcv, msg, data) {
            throw new GraceExceptionPacket(this, msg, data)
        },
        "match": function(argcv, other) {
            if (!other.exception)
                return new GraceFailedMatch(other);
            if (other.exception.name == this.name)
                return new GraceSuccessfulMatch(other);
            var exc = other.exception;
            while (exc) {
                if (exc.name == this.name)
                    return new GraceSuccessfulMatch(other);
                exc = exc.par;
            }
            return new GraceFailedMatch(other);
        },
        "|": function(argcv, o) {
            return new GraceOrPattern(this, o);
        },
        "&": function(argcv, o) {
            return new GraceAndPattern(this, o);
        },
        "asString": function(argcv) {
            return new GraceString(this.name);
        },
    },
    className: 'Exception'
}

var importedModules = {};

function do_import(modname, func) {
    if (importedModules[modname]) {
        return importedModules[modname];
    }
    if (!func)
        throw new GraceExceptionPacket(ImportErrorObject,
            new GraceString("Could not find module '" + modname + "'"));
    var origSuperDepth = superDepth;
    superDepth = Grace_allocModule(modname);
    var f = func.call(superDepth);
    superDepth = origSuperDepth;
    importedModules[modname] = f;
    return f;
}

function dbgp(o, d) {
    if (d == undefined)
        d = 0;
    var i;
    var ind = "";
    for (i=0; i<d; i++)
        ind += "  ";
    if (typeof(o) == "function") {
        return "function";
    }
    if (typeof(o) == "number") {
        return "" + o;
    }
    if (typeof(o) == "boolean") {
        return "" + o;
    }
    if (typeof(o) == "string") {
        return '"' + o + '"';
    }
    var s = "Object{\n";
    for (var t in o) {
        s += ind + "  " + t + ": " + dbgp(o[t], d + 1) + "\n";
    }
    return s + ind + "}";
}

function dbg(o) {
    minigrace.stderr_write(dbgp(o, 0) + "\n");
}

var extensionsMap = callmethod(var_HashMap, "new", [0]);
var var_done = new GraceObject();
var_done.methods.asString = function() { return new GraceString("done"); };
var ellipsis = Grace_allocObject();
ellipsis.methods.asString = function() {return new GraceString("ellipsis");}

var ExceptionObject = new GraceException("Exception", false);
var ErrorObject = new GraceException("Error", ExceptionObject);
var RuntimeErrorObject = new GraceException("RuntimeError", ErrorObject);
var ImportErrorObject = new GraceException("ImportError", RuntimeErrorObject);
var TypeErrorObject = new GraceException("TypeError", RuntimeErrorObject);

var Grace_native_prelude = Grace_allocObject();
var Grace_prelude = Grace_native_prelude;
var var___95__prelude = Grace_native_prelude;
Grace_prelude.methods["Exception"] = function(argcv) {
    return ExceptionObject;
}
Grace_prelude.methods["Error"] = function(argcv) {
    return ErrorObject;
}
Grace_prelude.methods["RuntimeError"] = function(argcv) {
    return RuntimeErrorObject;
}
Grace_prelude.methods["TypeError"] = function(argcv) {
    return TypeErrorObject;
}
Grace_prelude.methods["while()do"] = function(argcv, c, b) {
    if (c.className == "Boolean" || c.className == "Number")
        throw new GraceExceptionPacket(TypeErrorObject,
            new GraceString("expected Block for argument condition (1) of "
                + "while()do, got " + c.className));
    if (Grace_prelude.methods["while()do"] &&
            Grace_prelude.methods["while()do"].safe) {
        var count = 0;
        var runningTime = 0;
        var runningCount = 0;
        var startTime = new Date();
        var diff;
        while (Grace_isTrue(callmethod(c, "apply", [0]))) {
            count++;
            if (count % 100000 == 0 && ((diff=new Date()-startTime) > 5000)) {
                var totTime = runningTime + diff;
                var totIterations = runningCount + count;
                if (confirm("A while loop is taking a long time to run. Do you want to stop the program? " + totIterations + " iterations of the loop have taken "
                            + totTime + "ms so far."
                            + "\n\nChoose OK to stop the loop or Cancel to "
                            + "let it continue."))
                    throw new GraceExceptionPacket(RuntimeErrorObject,
                        new GraceString("user abort of possibly-infinite loop."));
                else {
                    runningCount += count;
                    runningTime += diff;
                    count = 0;
                    startTime = new Date();
                }
            }
            callmethod(b, "apply", [0]);
        }
        return var_nothing;
    }
    while (Grace_isTrue(callmethod(c, "apply", [0]))) {
        callmethod(b, "apply", [0]);
    }
    return var_done;
}
Grace_prelude.methods["for()do"] = function(argcv, c, b) {
    var iter = callmethod(c, "iterator", [0]);
    while (Grace_isTrue(callmethod(iter, "havemore", [0]))) {
        var val = callmethod(iter, "next", [0]);
        callmethod(b, "apply", [1], val);
    }
    return var_done;
}
Grace_prelude.methods["_methods"] = function() {
    var meths = [];
    for (m in this.methods)
        meths.push(new GraceString(m));
    var s = this.superobj;
    while (s) {
        for (m in s.methods)
            meths.push(new GraceString(m));
        s = s.superobj;
    }
    var l = new GraceList(meths);
    return l;
}
Grace_prelude.methods["clone"] = function(argcv, obj) {
  return obj;
}
Grace_prelude.methods["become"] = function(argcv, a, b) {
    for(var k in a) {
        var t = a[k];
        a[k] = b[k];
        b[k] = t;
    }
    return var_done;
}

var PrimitiveArrayClass = new GraceObject();
PrimitiveArrayClass.methods["new"] = function(argcv, n) {
    return new GracePrimitiveArray(n._value);
};
Grace_prelude.methods["PrimitiveArray"] = function() { return PrimitiveArrayClass; };

function Grace_allocModule(modname) {
    var mod = Grace_allocObject();
    mod.methods.outer = function() {
        return this.outer;
    }
    mod.outer = Grace_prelude;
    mod.className = "module<" + modname + ">";
    return mod;
}
