method truemeth {
    print "Ran truemeth"
    true
}
method falsemeth {
    print "Ran falsemeth"
    false
}

print(true.orElse {truemeth}.orElse {truemeth})
print(true.orElse {falsemeth}.orElse {truemeth})
print(false.orElse {truemeth}.orElse {truemeth})
print(false.orElse {falsemeth}.orElse {truemeth})
print(false.orElse {falsemeth})
