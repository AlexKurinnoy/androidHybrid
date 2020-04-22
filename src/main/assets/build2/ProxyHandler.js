var url = require('url');
var http = require('http');

const HTTP_REQUEST_PARAMETER_ADDRESS = "address";
const HTTP_CONTENT_TYPE_BASE64 = "X-user/base64-data";

var knownHosts = [
	"czo.gov.ua",
	"acskidd.gov.ua",
	"ca.informjust.ua",
	"csk.uz.gov.ua",
	"masterkey.ua",
	"ocsp.masterkey.ua",
	"tsp.masterkey.ua",
	"ca.ksystems.com.ua",
	"csk.uss.gov.ua",
	"csk.ukrsibbank.com",
	"acsk.privatbank.ua",
	"ca.mil.gov.ua",
	"acsk.dpsu.gov.ua",
	"acsk.er.gov.ua",
	"ca.mvs.gov.ua",
	"canbu.bank.gov.ua",
	"uakey.com.ua",
	"ca.csd.ua",
	"altersign.com.ua",
	"ca.altersign.com.ua",
	"ocsp.altersign.com.ua",
	"acsk.uipv.org",
	"ocsp.acsk.uipv.org",
	"acsk.treasury.gov.ua",
	"ocsp.treasury.gov.ua",
	"ca.oschadbank.ua",
	"ca.gp.gov.ua"
];

function isKhownHost(urlValue) {
	try {
		var uri = url.parse(urlValue);
		var hostname = uri.hostname;

		if (hostname == null || hostname == "")
			hostname = urlValue;
		for (var i = 0; i < knownHosts.length; i++) {
			if (hostname == knownHosts[i])
				return true;
		}
	} catch (e) {
	}

	return false;
}

function getContentType(urlValue) {
	try {
		var uri = url.parse(urlValue);

		switch (uri.path) {
			case "/services/cmp":
			case "/public/x509/cmp":
				return "";

			case "/services/ocsp":
			case "/public/ocsp":
			case "/ocsp":
			case "/OCSPsrv/ocsp":
				return "application/ocsp-request";

			case "/services/tsp":
			case "/public/tsa":
			case "/tsp":
			case "/TspHTTPServer/tsp":
				return "application/timestamp-query";

			default:
				return "";
		}
	} catch (e) {
		return "";
	}
}

function handleRequest(method, path, data,
	resolve, reject) {
	try {
		if (method != 'POST' && method != 'GET') {
			reject(400);
			return;
		}
		if (method == "POST") {
			data = Buffer.from(data + '', 'base64');
			if (!data) {
				reject(400);
				return;
			}
		}

		var pathURL = url.parse(path, true);
		var address = pathURL.query[HTTP_REQUEST_PARAMETER_ADDRESS];
		if (!address || address == "") {
			reject(400);
			return;
		}

		if (address.indexOf("://") == -1)
			address = "http://" + address;

		if (!isKhownHost(address)) {
			reject(403);
			return;
		}
		
		var addressURL = url.parse(address, false);
		var hostname = addressURL.hostname;
		var path = addressURL.path;
		var port  = addressURL.port;

		var options = {
			hostname: hostname,
			port: port,
			path: path,
			method: method,
			headers: {}
		};

		if (method == 'POST') {
			options.headers['Content-Type'] = getContentType(address);
			options.headers['Content-Length'] = data.length;
		}
		
		var request = http.request(options, (response) => {
			var data = [];
			response.on('data', (chunk) => {
				data.push(chunk);
			});

			response.on('end', () => {
				data = Buffer.concat(data);
				data = (new Buffer(data)).toString("base64");
				resolve(data);
			})
		});
		
		request.on('error', (e) => {
			console.error(e);
			reject(500);
		});

		if (method == "POST") {
			data = Buffer.from(data, 'base64');
			request.write(data);
			request.end();
		}
	} catch (e) {
		console.error(e);
		reject(500)
	}
}

exports.handleRequest = function(request, response) {
	request.addListener('data', function(data) {
		(new Promise(function(resolve, reject) {
			handleRequest(request.method, request.url,
				data, resolve, reject)
		}))
		.then(function(data) {
			response.writeHead(200, 
				{
					'Content-Type': 'X-user/base64-data; charset=utf-8'
				}
			); 
			response.end(data);
		})
		.catch(function(status) {
			response.writeHead(status)
			response.end();
		});
	});
};