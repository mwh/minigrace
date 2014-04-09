dialect "ownership"
var y
def x = object {
    var a is owned := object {}
    y := a
}
