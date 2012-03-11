(function (global, undefined) {
    var _id, _defined = {}, _loads = {};

    // @util. array enumerator.
    function foreach(array, callback, context) {
        var i, l;
        if (array)
            for (i = 0, l = array.length; i < l; i++)
                callback.call(context, array[i], i);
    }

    //@concept. work is a promise after finishing doing something it calls done().

    // wait for some works done and then do something.
    function wait(works, then) {
        var i, len = (works && works.length) || 0, waits = len;
        if (waits)
            for (i = 0; i < len; i++)
                works[i](done);
        else
            done();

        function done() {
            if (waits > 0)
                waits--;

            if (!waits)
                then && then();
        }
    }

    // work wrapper so make sure only get called once.
    function once(work) {
        var queue = [], working, worked;
        return function (done) {
            if (worked) {
                done();
            }
            else if (working) {
                queue.push(done);
            }
            else {
                working = true;
                queue.push(done);
                work(function () {
                    worked = true;
                    while (queue.length) {
                        queue.shift()();
                    }
                });
            }
        }
    }

    // a simple way to load script by jquery. load is a work.
    function load(id, done) {
        if (_defined[id])
            done();
        else
            $.get(id, function (result) {
                _id = id;
                window.eval(result);
                _id = null;
                done();
            });
    }

    // get a load. if it's not created then create and store in _loads
    function get_load(id) {
        if (_loads[id])
            return _loads[id];

        return _loads[id] = once(function (done) {
            if (_defined[id] && 'result' in _defined[id]) {
                done();
                return;
            }

            load(id, function () {
                var def = _defined[id] || {};

                require(def.deps, function () {
                    def.fn ? (def.result = def.fn.apply(null, arguments)) : (def.result = null);
                    done();
                });
            });
        });
    }    

    // requirejs 'define' counterpart
    global.define = function define(id, deps, fn) {
        if (arguments.length === 1) {
            fn = id;
            deps = id = null;
        }
        else if (arguments.length === 2) {
            if ($.isArray(id)) {
                fn = deps;
                deps = id;
                id = null;
            } else {
                fn = deps;
                deps = null;
            }
        }

        if (id = (id || _id)) {
            _defined[id] = { "deps": deps, "fn": fn };
        }
    }

    // requirejs 'require' counterpart
    global.require = function require(deps, fn) {
        if (arguments.length === 1) {
            fn = deps;
            deps = null;
        }
        
        var loads = [], setup = {};
        _preload(deps, setup);

        foreach(setup.deps, function (id) {
            loads.push(get_load(id));
        });

        wait(loads, function () {
            var args = [];
            foreach(setup.outs, function (id) {
                args.push(_defined[id] && _defined[id].result);
            });

            fn.apply(null, args);
        });
    }
    
    // default preload. the dependent components and result returned as outs are default to deps.
    //setup has deps & outs. deps stand for requiring modules. outs stand for returning modules.
    var _preload = function (deps, setup) {
        setup.deps = deps;
        setup.outs = deps;
    }

    // do anything before load
    global.preload = function preload(fn) {
        var bak = _preload;
        _preload = function (deps, setup) {
            bak(deps, setup);
            fn(deps, setup);
        }
    }

    // handle group deps [] which is used for merge
    preload(function (deps, setup) {
        var d;
        setup.deps = [], setup.outs = [];
        foreach(deps, function (dep) {
            if ($.isArray(dep)) {
                var merge = [];
                foreach(dep, function (d) {
                    merge.push(d);
                    setup.outs.push(d);
                });
                setup.deps.push('merge?' + merge.join('&'));
            }
            else {
                setup.deps.push(dep);
                setup.outs.push(dep);
            }
        });
    });
})(window);