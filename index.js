// itsybitsy - a tiny link shortening server

var express = require("express"),
	levelup = require("level");

var db = levelup("./itsybitsy-data"),
	app = express();

function randomString(length) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

	if (!length) {
		length = 8;
	}

	var str = '';
	for (var i = 0; i < length; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	return str;
}

app.get("/put", function(req, res) {
	var id = randomString();
	var url = req.query.url;

	if (!url) {
		res.status(400).end("400 Client error: Invalid parameters!");
		return;
	}

	db.get(id, function(err, val) {
		if (err) {
			if (err.notFound) {
				db.put(id, url, function(err) {
					if (err) {
						res.status(500).end(err);
						return;
					}

					res.status(201).end(JSON.stringify({ status: 201, id: id }));
				});
			}
		} else {
			res.status(403).end("403 Forbidden: That ID is already in use!");
		}
	});
});

app.get("/:id", function(req, res) {
	var id = req.params.id;

	if (id != null) {
		db.get(id, function(err, val) {
			if (err) {
				if (err.notFound)
					res.status(404).end("That link wasn't found. :(");
				else
					res.status(500).end(err);
				return;
			}

			res.set("Location", val);
			res.status(301).end();
		});
	}
});

app.listen(1341);
console.log("[itsybitsy] bound to ::1341");