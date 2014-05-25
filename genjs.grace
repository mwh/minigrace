#pragma DefaultVisibility=public
import "genes" as genes
import "io" as io
method compile(vl, of, mn, rm, bt, glpath) {
    io.error.write("Use of the 'js' backend is deprecated. Use 'es'.\n")
    genes.compile(vl, of, mn, rm, bt, glpath)
}

method processDialect(values') {
    genes.processDialect(values')
}
