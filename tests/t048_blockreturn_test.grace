method blockrun(bk) {
    bk.apply
    return 100
}
method foo {
    var a := { return 6 }
    print "here"
    a.apply
    print "not here"
}
method baz {
    var a := { return 13 }
    blockrun(a)
    return 9
}

var b := foo
print(b)
print(baz)

method bar(n) {
    def blk = { v->
        if (v > n) then {
            return v
        }
    }
    blk.apply(1)
    blk.apply(5)
    blk.apply(6)
    blk.apply(3)
    blk.apply(12)
    blk.apply(9)
    blk.apply(7)
    blk.apply(15)
    blk.apply(13)
    return 0
}

print(bar(10))
print(bar(20))
print(bar(5))
