var http = require('http');
var sec = require('./sec');

/*var imgData = {

}*/

function onRequest(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
   // response.write(request);    
  //  response.write(sec.preprocessGalleryData("dasf"));    
    response.end();
}

http.createServer(onRequest).listen(5000);