class ConsGood.new(hd', tl') {
    def hd = hd'
    def tl = tl'
    def brand = "Cons"
    method extract {
        return object {
            def x is public = hd'
            def y is public = tl'
        }
    }
}

def a = ConsGood.new(3, 4)
def b = ConsGood.new(6, 7)
def ae = a.extract
print "{ae.x} {ae.y}"
def be = b.extract
print "{be.x} {be.y}"

