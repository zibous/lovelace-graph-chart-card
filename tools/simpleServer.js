/**
 * simple server to save the chartdata
 * 
 */

const http = require("http")
const fs = require("fs")

/**
 * Create an HTTP server so that we can listen for, and respond to
 * incoming HTTP requests. This requires a callback that can be used
 * to handle each incoming request.
 */
var server = http.createServer(function (request, response) {
    var origin = request.headers.origin || "*"
    if (request.method.toUpperCase() === "OPTIONS") {
        response.writeHead("204", "No Content", {
            "access-control-allow-origin": origin,
            "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
            "access-control-allow-headers": "content-type, accept",
            "access-control-max-age": 10, // Seconds.
            "content-length": 0
        })
        return response.end()
    }

    var requestBodyBuffer = []
    request.on("data", function (chunk) {
        requestBodyBuffer.push(chunk)
    })

    request.on("end", function () {
        var requestBody = requestBodyBuffer.join("")
        var responseBody =
            "Thank You For The Cross-Domain AJAX Request:\n\n" + "Method: " + request.method + "\n\n" + requestBody

        var file = "./chartdata/" + request.url.split("=")[1]
        console.log(`Write response to file ${file}`)
        fs.writeFile(file, requestBody, function (err) {
            if (err) return console.log(err)
            console.log(`Wrote chart data in file ${file}, just check it`)
        })

        response.writeHead("200", "OK", {
            "access-control-allow-origin": origin,
            "content-type": "text/plain",
            "content-length": responseBody.length
        })

        // Close out the response.
        return response.end(responseBody)
    })
})

/**
 * Bind the server to port 8080.
 */
server.listen(8000)

// Debugging:
console.log("Node.js listening on port 8000")
