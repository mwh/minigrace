var kwyj1 := 1
var kwyj2 := 2
import util

// This module contains pseudo-classes for all the AST nodes used
// in the parser. The module predates the existence of classes in the
// implementation, so they are written as object literals inside methods.
// Each node has a different signature according to its function, but the
// common interface is:
// type ASTNode {
//   kind -> String // Used for pseudo-instanceof tests.
//   register -> String // Used later on to hold the LLVM register of
//                      // the resulting object.
//   line -> Number // The source line the node came from.
//   pretty(n:Number) -> String // Pretty-print of node at depth n,
// }
// Most also contain "value", with varied types, holding the main value
// in the node. Some contain other fields for their specific use: while has
// both a value (the condition) and a "body", for example. None of the nodes
// are particularly notable in any way.

method astfor(over, body') {
    object {
        var kind := "for"
        var value := over
        var body := body'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "For\n"
            s := s ++ spc ++ self.value.pretty(depth+1)
            s := s ++ "\n"
            s := s ++ spc ++ "Do:"
            s := s ++ "\n" ++ spc ++ "  " ++ self.body.pretty(depth + 1)
            s
        }
    }
}
method astwhile(cond, body') {
    object {
        var kind := "while"
        var value := cond
        var body := body'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "While\n"
            s := s ++ spc ++ self.value.pretty(depth+1)
            s := s ++ "\n"
            s := s ++ spc ++ "Do:"
            for (self.body) do { x ->
                s := s ++ "\n  "++ spc ++ x.pretty(depth+2)
            }
            s
        }
    }
}
method astif(cond, thenblock', elseblock') {
    object {
        var kind := "if"
        var value := cond
        var thenblock := thenblock'
        var elseblock := elseblock'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "If\n"
            s := s ++ spc ++ self.value.pretty(depth+1)
            s := s ++ "\n"
            s := s ++ spc ++ "Then:"
            for (self.thenblock) do { ix ->
                s := s ++ "\n  "++ spc ++ ix.pretty(depth+2)
            }
            s := s ++ "\n"
            s := s ++ spc ++ "Else:"
            for (self.elseblock) do { ix ->
                s := s ++ "\n  "++ spc ++ ix.pretty(depth+2)
            }
            s
        }
    }
}
method astblock(params', body') {
    object {
        var kind := "block"
        var value := "block"
        var params := params'
        var body := body'
        var selfclosure := true
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Block\n"
            s := s ++ spc ++ "Parameters:"
            for (self.params) do { mx ->
                s := s ++ "\n  "++ spc ++ mx.pretty(depth+2)
            }
            s := s ++ "\n"
            s := s ++ spc ++ "Body:"
            for (self.body) do { mx ->
                s := s ++ "\n  "++ spc ++ mx.pretty(depth+2)
            }
            s
        }
    }
}
method astmethod(name', params', body', type') {
    object {
        var kind := "method"
        var value := name'
        var params := params'
        var body := body'
        var type := type'
        var varargs := false
        var vararg := false
        var selfclosure := false
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Method\n"
            s := s ++ spc ++ "Name: " ++ self.value.pretty(depth+1)
            s := s ++ "\n"
            s := s ++ spc ++ "Parameters:"
            for (self.params) do { mx ->
                s := s ++ "\n  "++ spc ++ mx.pretty(depth+2)
            }
            s := s ++ "\n"
            s := s ++ spc ++ "Body:"
            for (self.body) do { mx ->
                s := s ++ "\n  "++ spc ++ mx.pretty(depth+2)
            }
            s
        }
    }
}
method astcall(what, with') {
    object {
        var kind := "call"
        var value := what
        var with := with'
        var line := 0 + util.linenum
        var register := ""
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Call\n"
            s := s ++ spc ++ "Method:\n"
            s := s ++ "  " ++ spc ++ self.value.pretty(depth+2)
            s := s ++ "\n"
            s := s ++ spc ++ "Parameters:"
            for (self.with) do { x ->
                s := s ++ "\n  "++ spc ++ x.pretty(depth+2)
            }
            s
        }
    }
}
method astclass(name', params', body', superclass') {
    object {
        var kind := "class"
        var value := body'
        var name := name'
        var params := params'
        var register := ""
        var line := util.linenum
        var superclass := superclass'
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Class(" ++ self.name.pretty(0) ++ ")"
            if (self.superclass /= false) then {
                s := s ++ "\n" ++ spc ++ "Superclass:"
                s := s ++ "\n  " ++ spc ++ self.superclass.pretty(depth + 2)
            }
            s := s ++ "\n" ++ spc ++ "Parameters:"
            for (self.params) do {x->
                s := s ++ "\n  " ++ spc ++ x.pretty(depth+2)
            }
            s := s ++ "\n" ++ spc ++ "Body:"
            for (self.value) do { x ->
                s := s ++ "\n  "++ spc ++ x.pretty(depth+2)
            }
            s
        }
    }
}
method astobject(body, superclass') {
    object {
        var kind := "object"
        var value := body
        var register := ""
        var line := util.linenum
        var superclass := superclass'
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Object"
            if (self.superclass /= false) then {
                s := s ++ "\n" ++ spc ++ "Superclass:"
                s := s ++ "\n  " ++ spc ++ self.superclass.pretty(depth + 1)
                s := s ++ "\n" ++ spc ++ "Body:"
                depth := depth + 1
            }
            for (self.value) do { x ->
                s := s ++ "\n"++ spc ++ x.pretty(depth+1)
            }
            s
        }
    }
}
method astarray(values) {
    object {
        var kind := "array"
        var value := values
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { ai ->
                spc := spc ++ "  "
            }
            var s := "Array"
            for (self.value) do { ax ->
                s := s ++ "\n"++ spc ++ ax.pretty(depth+1)
            }
            s
        }
    }
}
method astmember(what, in') {
    object {
        var kind := "member"
        var value := what
        var in := in'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Member(" ++ self.value ++ ")\n"
            s := s ++ spc ++ self.in.pretty(depth+1)
        }
    }
}
method astidentifier(n, type') {
    object {
        var kind := "identifier"
        var value := n
        var type := type'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            "Identifier(" ++ self.value ++ ")"
        }
    }
}
method astoctets(n) {
    object {
        var kind := "octets"
        var value := n
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            "Octets(" ++ self.value ++ ")"
        }
    }
}
method aststring(n) {
    object {
        var kind := "string"
        var value := n
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            "String(" ++ self.value ++ ")"
        }
    }
}
method astnum(n) {
    object {
        var kind := "num"
        var value := n
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            "Num(" ++ self.value ++ ")"
        }
    }
}
method astop(op, l, r) {
    object {
        var kind := "op"
        var value := op
        var left := l
        var right := r
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Op(" ++ self.value ++ ")"
            s := s ++ "\n"
            s := s ++ spc ++ self.left.pretty(depth + 1)
            s := s ++ "\n"
            s := s ++ spc ++ self.right.pretty(depth + 1)
            s
        }
    }
}
method astindex(expr, index') {
    object {
        var kind := "index"
        var value := expr
        var index := index'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Index"
            s := s ++ "\n"
            s := s ++ spc ++ self.value.pretty(depth + 1)
            s := s ++ "\n"
            s := s ++ spc ++ self.index.pretty(depth + 1)
            s
        }
    }
}
method astbind(dest', val') {
    object {
        var kind := "bind"
        var dest := dest'
        var value := val'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Bind"
            s := s ++ "\n"
            s := s ++ spc ++ self.dest.pretty(depth + 1)
            s := s ++ "\n"
            s := s ++ spc ++ self.value.pretty(depth + 1)
            s
        }
    }
}
method astconstdec(name', val, type') {
    object {
        var kind := "constdec"
        var name := name'
        var value := val
        var type := type'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "ConstDec"
            s := s ++ "\n"
            s := s ++ spc ++ self.name.pretty(depth)
            if (self.type) then {
                s := s ++ " : " ++ self.type.pretty(0)
            }
            if (self.value) then {
                s := s ++ "\n  "
                s := s ++ spc ++ self.value.pretty(depth + 1)
            }
            s
        }
    }
}
method astvardec(name', val', type') {
    object {
        var kind := "vardec"
        var name := name'
        var value := val'
        var type := type'
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for ((0..depth)) do { i ->
                spc := spc ++ "  "
            }
            var s := "VarDec"
            s := s ++ "\n"
            s := s ++ spc ++ self.name.pretty(depth + 1)
            if (self.type) then {
                s := s ++ " : " ++ self.type.pretty(0)
            }
            if (self.value) then {
                s := s ++ "\n    "
                s := s ++ spc ++ self.value.pretty(depth + 1)
            }
            s
        }
    }
}
method astimport(name) {
    object {
        var kind := "import"
        var value := name
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Import"
            s := s ++ "\n"
            s := s ++ spc ++ self.value.pretty(depth + 1)
            s
        }
    }
}
method astreturn(expr) {
    object {
        var kind := "return"
        var value := expr
        var register := ""
        var line := util.linenum
        method pretty(depth) {
            var spc := ""
            for (0..depth) do { i ->
                spc := spc ++ "  "
            }
            var s := "Return"
            s := s ++ "\n"
            s := s ++ spc ++ self.value.pretty(depth + 1)
            s
        }
    }
}
