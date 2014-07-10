method truemeth {
    print "Ran truemeth"
    true
}
method falsemeth {
    print "Ran falsemeth"
    false
}

print(true.andAlso {truemeth}.andAlso {truemeth})
print(true.andAlso {falsemeth}.andAlso {truemeth})
print(false.andAlso {truemeth})
