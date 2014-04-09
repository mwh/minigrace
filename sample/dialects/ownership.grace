dialect "dialect"

// This dialect implements a rudimentary ownership system where the
// only owner is the immediately-surrounding object. It demonstrates
// the use of the dialect dialect to implement checkers requiring
// state to be maintained for expressions.

import "ast" as ast
import "util" as util
import "StandardPrelude" as prelude

inherits prelude.methods

// Type error.

def TypeError is public = CheckerFailure.refine("TypeError")
def OwnershipError is public = CheckerFailure.refine "OwnershipError"

// Object literals.

rule { obj : ObjectLiteral ->
    scope.enter { processBody(obj.value) }
    "fresh"
}

// Simple literals.

rule { _ : NumberLiteral | OctetsLiteral ->
    "fresh"
}

rule { _ : StringLiteral ->
    "fresh"
}

rule { ident : Identifier ->
    scope.variables.find(ident.value) butIfMissing { "normal" }
}

rule { v : Var | Def ->
    if (isOwned(v)) then {
        scope.variables.at(v.name.value)put("owned")
    } else {
        scope.variables.at(v.name.value)put("normal")
    }
}

rule { bind : Bind ->
    def dest = bind.dest
    def dType = typeOf(dest)

    def value = bind.value
    def vType = typeOf(value)

    match (dType)
        case { "owned" ->
            if (vType != "fresh") then {
                OwnershipError.raiseWith(
                    "An owned field can only be assigned a fresh object",
                    dest)
            }
        }
        case { "normal" ->
            match (vType)
                case { "owned" | "borrowed" ->
                    OwnershipError.raiseWith(
                        "Only normal and fresh values can be assigned to "
                            ++ "normal variables, not {vType}",
                        value)

                }
                case { _ -> }
        }
}

method owned {}
method borrowed {}

method processBody(body) {
    for (body) do { node ->
        checkTypes(node)
    }
}

method isOwned(annotatedNode) {
    var isOwned := false
    for (annotatedNode.annotations) do { ann ->
        if (ann.value == "owned") then {
            return true
        }
    }
    return false
}

method checker(nodes) {
    check(nodes)
}
