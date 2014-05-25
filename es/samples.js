var samples = {
    'loopinvariant': {
        'name': 'Loop invariants dialect',
        'dir': 'dialects',
    },
    'loopinvariant_example': {
        'name': 'Loop invariant example',
        'dir': 'dialects',
        'requires': ['loopinvariant'],
    },
    'fsm': {
        'name': 'Finite state machine dialect',
        'dir': 'dialects',
    },
    'fsm_example': {
        'name': 'FSM client code',
        'requires': ['fsm'],
        'dir': 'dialects',
    },
    'ObjectAssociations': {
        'name': 'Object associations dialect',
        'dir': 'dialects',
    },
    'ObjectAssociations_example': {
        'name': 'OA client code',
        'dir': 'dialects',
        'requires': ['ObjectAssociations'],
    },
    'structural': {
        'name': 'Structural typing dialect',
        'dir': 'dialects',
        'requires': ['dialect'],
    },
    'structural_example': {
        'name': 'Structural typing example',
        'dir': 'dialects',
        'requires': ['dialect', 'structural'],
    },
    'StaticGrace': {
        'name': 'Static Grace dialect',
        'dir': 'dialects',
    },
    'dialect': {
        'name': 'Dialect dialect',
        'dir': 'dialects',
    },
    'dialect_example': {
        'name': 'Dialect client code',
        'dir': 'dialects',
        'requires': ['dialect'],
    },
    'grapl': {
        'name': 'GrAPL dialect',
        'dir': 'dialects',
    },
    'grapl_example': {
        'name': 'GrAPL example',
        'dir': 'dialects',
        'requires': ['grapl'],
    },
    'simplegraphics': {
        'name': 'Simple graphics module',
        'dir': 'js',
        'requires': [],
    },
    'simplegraphics_example': {
        'name': 'Simple graphics demo',
        'dir': 'graphics',
        'requires': ['simplegraphics'],
    },
    'turtle': {
        'name': 'Turtle graphics module',
        'dir': 'js',
        'requires': [],
    },
    'logo': {
        'name': 'Logo-like dialect',
        'dir': 'graphics',
        'requires': ['turtle'],
    },
    'logo_example': {
        'name': 'Logo-like client code',
        'dir': 'graphics',
        'requires': ['turtle', 'logo'],
    },
    'pong': {
        'name': 'DOM Pong',
        'dir': 'js',
        'requires': [],
    },
    'sniff': {
        'name': 'Sniff graphics dialect',
        'dir': 'js',
        'requires': [],
    },
    'sniffpong': {
        'name': 'Sniff-based pong',
        'dir': 'js',
        'requires': ['sniff'],
    },
};

window.onload = function() {
    var sm = document.getElementById('sample');
    for (var s in samples) {
        var opt = document.createElement('option');
        opt.value = s;
        opt.innerHTML = samples[s].name;
        sm.appendChild(opt);
    }
};

function loadSampleJS(k) {
    if (window[k])
        return;
    var sample = samples[k];
    document.getElementById('stderr_txt').value += "\nUI: Loading sample dependency " + sample.name;
    var req = new XMLHttpRequest();
    req.open("GET", "./sample/" + sample.dir + '/' + k + ".js", false);
    req.send(null);
    if (req.status == 200) {
        var theModule;
        eval(req.responseText);
        eval("theModule = gracecode_" + k + ";");
        window['gracecode_' + k] = theModule;
    } else {
        alert("Loading sample JavaScript code failed: retrieving " + k +
                " returned " + req.status);
    }
    req.open("GET", "./sample/" + sample.dir + '/' + k + ".gct", false);
    req.send(null);
    if (req.status == 200) {
        gctCache[k] = req.responseText;
    } else {
        alert("Loading sample JavaScript code metadata failed: retrieving "
                + k + " returned " + req.status);
    }
}

function loadsample(k) {
    var sample = samples[k];
    document.getElementById('stderr_txt').value = "UI: Loading " + sample.name;
    if (sample.requires) {
        for (var i=0; i<sample.requires.length; i++)
            loadSampleJS(sample.requires[i]);
    }
    var req = new XMLHttpRequest();
    req.open("GET", "./sample/" + sample.dir + '/' + k + ".grace", false);
    req.send(null);
    if (req.status == 200) {
        if (ace)
            editor.setValue(req.responseText, -1);
        document.getElementById("code_txt").value = req.responseText;
        document.getElementById('modname').value = k;
    }
    document.getElementById('stderr_txt').value += "\nUI: done loading sample.\n";
    updateDownloadLink();
}
