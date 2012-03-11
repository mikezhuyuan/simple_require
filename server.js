// config
var port = 8080, base_dir = __dirname, routers = [];

// server's merge method implementation
routers.push(['/merge', function (req, res) {
    var files = {}, deps = Object.keys(req.query);
    merge(deps, files);
    var r = '';
    Object.keys(files).forEach(function (key) {
        r += '\n' + files[key];
    });
    
    files = [];
    deps.forEach(function (file) {
        files.push("'" + file + "'");
    });

    r += "\ndefine('" + req.url.substring(1) + "', [" + files.join(',') + "], function () { });";
    res.end(r);
}]);

function merge(deps, r) {
    deps && deps.length && deps.slice && deps.forEach(function (path) {
        var itm = parse(path);
        if (!r[itm.path]) {
            merge(itm.deps, r);
            r[itm.path] = itm.file;
        }
    });

    return r;
}

function parse(path) {
    var file = require('fs').readFileSync(__dirname + '/' + path).toString(), d = file.replace(/\{.*\}/g, '{}');

    return {
        path: path,
        deps: eval(d),
        file: file.replace(/define\s*\(/, "define('" + path + "',")
    };
}

function define(deps) {
    return deps;
}

// simple http server
(function(http, fs, path, parse, mime){
    http.createServer(function (req, res) {   
        var url = parse(req.url,true),
            query = req.query = url.query,
            pth = req.path = url.pathname,
            ext = req.ext = path.extname(req.path);

        //router
        for(var i=0, l=routers.length; i<l; i++){
            if(routers[i][0] === pth){
                routers[i][1](req, res);
                return;
            }
        }

        //static file
        fs.readFile(base_dir + pth, function (err, data) {
			if (err) {
				req.err = { "code": 404, "err": err };
				return;
			}

			res.writeHead(200, { "Content-Type": mime[req.ext.toLowerCase()] });
			res.end(data);

            return;
		});
    })
    .listen(port); 
})
(require('http'),    
require('fs'),
require('path'), 
require('url').parse,
{".js": "application/javascript",
".css": "text/css",
".html": "text/html",
".htm": "text/html"});