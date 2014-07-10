method objcreator(x', y') {
    object {
        method extract {
            object {
                def x is public = x'
                def y is public = y'
            }
        }
    }
}

def a = objcreator(3, 4)
def b = objcreator(6, 7)
def ae = a.extract
print "{ae.x} {ae.y}"
def be = b.extract
print "{be.x} {be.y}"

