let http = require('http');
let fs = require('fs');
let url = require('url');
let path = require('path');

const service = require('./service');

const routeFunc = function(req, res) {
	const requestURL = req.url;
	const parsedURL = url.parse(requestURL, true);

	const queryData = parsedURL.query;
	const pathName = parsedURL.pathname;


	switch(pathName) {
		case "/":
			fs.readFile("../frontend/template.html", function (err, data) {
				if (err) {
					service.hadError(err, res);
				}
				service.index(res, data);
			});
			break;
		case "/editfile":
			service.editfile(req, res);
			break;
		case "/cd":
			service.cd(req,res);
			break;
		case "/readfile":
			service.readfile(req, res);
			break;
		case "/mkdir":
			service.mkdir(req, res);
			break;
		case "/rmdir":
			service.rmdir(req,res);
			break;
		case "/rename":
			service.rename(req, res);
			break;
		case "/rmFile":
			service.rmFile(req, res);
			break;
		
	}
}

module.exports = {
	routeFunc,
}