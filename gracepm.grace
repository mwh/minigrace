import "io" as io
import "sys" as sys
import "curl" as curl

def moduleLocations = [
    sys.environ.at "HOME" ++ "/.local/lib/grace/modules/",
    "/usr/local/lib/grace/modules/",
    "/usr/lib/grace/modules/",
    "./",
    "../minigrace/"
]

method findImports(filename) {
    def fp = io.open(filename, "r")
    def imports = []
    while {!fp.eof} do {
        def line = fp.getline
        if (line.startsWith "import \"") then {
            def start = 9
            var end := 10
            while {line.at(end) != "\""} do {
                end := end + 1
            }
            imports.push(line.substringFrom(start)to(end - 1))
        } else {
            if (line.startsWith "#" || line.startsWith "//"
                || line.startsWith "type " || line.startsWith " "
                || line.startsWith "\}")
                then {
            } else {
                if (line == "") then {
                } else {
                    return imports
                }
            }
        }
    }
    return imports
}

method mkdirp(filepath) {
    io.system("mkdir -p \"{filepath}\"")
}

method dirname(filepath) {
    var i := filepath.size
    while {i > 0} do {
        if (filepath.at(i) == "/") then {
            return filepath.substringFrom(1)to(i - 1)
        }
        i := i - 1
    }
    return filepath
}

method fetchModule(path, dest) {
    print "Retrieving module from https://{path}.grace..."
    def req = curl.easy
    req.url := "https://{path}.grace"
    var source := ""
    req.onReceive { data ->
        source := source ++ data.decode "utf-8"
    }
    req.followLocation := true
    req.perform
    if (req.responseCode == 200) then {
        mkdirp(dirname("{dest}{path}"))
        def fp = io.open("{dest}{path}.grace", "w")
        fp.write(source)
        fp.close
    } else {
        io.error.write "Unable to retrieve {path}: response code {req.responseCode}"
    }
}

method fetchResource(path, dest) {
    print "Retrieving resource from https://{path}..."
    def req = curl.easy
    req.url := "https://{path}"
    var source := false
    req.onReceive { data ->
        if (false == source) then {
            source := data
        } else {
            source := source ++ data
        }
    }
    req.followLocation := true
    req.perform
    if (req.responseCode == 200) then {
        mkdirp(dirname("{dest}{path}"))
        def fp = io.open("{dest}{path}", "w")
        fp.writeBinary(source)
        fp.close
    } else {
        io.error.write "Unable to retrieve {path}: response code {req.responseCode}"
    }
}

method isResourcePath(path) {
    var i := path.size
    while {i > 0} do {
        if (path.at(i) == ".") then {
            return true
        }
        if (path.at(i) == "/") then {
            return false
        }
        i := i - 1
    }
    return false
}

method findLocalPath(path) {
    def isRP = isResourcePath(path)
    for (moduleLocations) do {loc->
        if (isRP) then {
            if (io.exists(loc ++ path)) then {
                return loc ++ path
            }
        } else {
            if (io.exists("{loc}{path}.grace")) then {
                return "{loc}{path}.grace"
            }
            if (io.exists("{loc}{path}.gso")) then {
                return "{loc}{path}.gso"
            }
        }
    }
    return ""
}

method satisfyImport(path, force) {
    if (path == "io") then {
        return true
    }
    if (path == "sys") then {
        return true
    }
    def lp = findLocalPath(path)
    if (!force) then {
        if (lp != "") then {
            return true
        }
    } else {
        if (lp.substringFrom(lp.size - 3)to(lp.size) == ".gso") then {
            return true
        }
    }
    if (isResourcePath(path)) then {
        fetchResource(path, moduleLocations.at 1)
    } else {
        fetchModule(path, moduleLocations.at 1)
    }
}

method satisfyDependencies(filename, force) {
    if (filename.substringFrom(filename.size - 3)to(filename.size) == ".gso")
        then {
            return true
    }
    def imports = findImports(filename)
    for (imports) do { im ->
        satisfyImport(im, force)
        if (!isResourcePath(im)) then {
            satisfyDependencies(findLocalPath(im), force)
        }
    }
}

method installCommand(path) {
    satisfyImport(path, false)
    if (isResourcePath(path)) then {
        return true
    }
    def lp = findLocalPath(path)
    if (lp != "") then {
        satisfyDependencies(lp, false)
    }
}

method updateCommand(path) {
    satisfyImport(path, true)
    if (isResourcePath(path)) then {
        return true
    }
    def lp = findLocalPath(path)
    if (lp != "") then {
        satisfyDependencies(lp, true)
    }
}

if (sys.argv.size > 1) then {
    def command = sys.argv.at(2)
    match(command)
        case { "satisfy" -> satisfyDependencies(sys.argv.at(3), false) }
        case { "install" -> installCommand(sys.argv.at(3)) }
        case { "update" -> updateCommand(sys.argv.at(3)) }
        case { "fetch" -> satisfyImport(sys.argv.at(3), true) }
        case { _ ->
            io.error.write "No such command '{command}'."
            sys.exit(1)
        }
} else {
    print "Usage: gracepm [satisfy FILE | install PATH | update PATH]"
}
