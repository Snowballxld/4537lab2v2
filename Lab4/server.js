const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const PORT = process.env.PORT || 3000;
let dictionary = [];
let requestCount = 0;

/*
200: Succesfully found
201: Succesful action
400: Invalid request/input
404: Not Found
409: Conflict
*/

const server = http.createServer((req, res) => {
    // Enable CORS for cross-origin requests from Server 1
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const query = parsedUrl.query;

    //chatgpt wrote from here tooooooo.......
    if (pathName.startsWith('/scripts/') || pathName.startsWith('/styles/') || pathName.startsWith('/images/')) {
        const filePath = path.join(__dirname, pathName);  // Construct the file path

        const extname = path.extname(filePath);  // Get file extension for content-type
        let contentType = 'text/plain';

        // Determine the content-type based on file extension
        if (extname === '.html') {
            contentType = 'text/html';
        } else if (extname === '.js') {
            contentType = 'application/javascript';
        } else if (extname === '.css') {
            contentType = 'text/css';
        } else if (extname === '.jpg' || extname === '.jpeg') {
            contentType = 'image/jpeg';
        } else if (extname === '.png') {
            contentType = 'image/png';
        }

        // Read the static file and send it as the response
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
        return;  // Stop further handling as static file has been served
    }
    //....oooo here


    // Handle HTML pages (like /store and /search)
    if (pathName === '/search' || pathName === '/store') {
        const filePath = path.join(__dirname, 'views', pathName + '.html');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }


    if (req.method === 'GET' && pathName === '/api/definitions') {

        //get
        requestCount++;
        const word = query.word;

        //checks for validity of request
        if (!word || typeof word !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: "Invalid request. Please provide a word." }));
        }

        //checks if the word exists at all
        const entry = dictionary.find(entry => {
            return entry.word.toLowerCase() === word.toLowerCase();
        });

        //decides what to do depending on if the word already exists
        if (entry) {
            //returns the request count, word, and definiiton
            res.writeHead(200, { 'Content-Type': 'application/json' });
            const definition = entry.definition;
            res.end(JSON.stringify({ requestCount, word, definition }));
        } else {
            //error word not found
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ requestCount, message: 'Word ' + word + ' not found!' }));
        }

    } else if (req.method === 'POST' && pathName === '/api/definitions') {

        //post
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            requestCount++;
            const data = JSON.parse(body);
            const word = data.word;
            const definition = data.definition;

            //checks for valididty of the input
            if (!word || !definition || typeof word !== 'string' || typeof definition !== 'string') {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: "Invalid input. Word and definition must be non-empty strings." }));
            }

            //checks if the word already exists
            const entry = dictionary.find(entry => {
                return entry.word.toLowerCase() === word.toLowerCase();
            });

            //decides what to do depending on whether the word exists
            if (entry) {
                //error, word already exists
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Warning! ' + word + ' already exists.' }));
            } else {

                //returns the request count, 
                dictionary.push({ word, definition });
                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    requestCount,
                    totalWords: dictionary.length,
                    message: 'New entry recorded: ' + word + ':' + definition
                }));

            }

        });

    } else {

        //error
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpoint not found." }));

    }
});

//run the server
server.listen(PORT);
