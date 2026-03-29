## http.createServer(app) 
gives us a single shared server that both Express(HTTP requests) and socket.io(webSocket upgrades) can ride on - same port,same connection lifecycle.

if we skip and do:
    const app=express()
    const io=new Server(3000);
    app.listen(3000);
the REST routes and socket events would be on different servers which would make impossible to upgrade the http request also there can port conflicts.


## **Socket.io**
const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})
*Both express and socket uses the samer server*
this lines ensure that the ws(Web scokets) request can also perfom http methods 

**io**: walkie-talkie Tower (talk to anyone)
**sockt**: one specific walkie-talkie(One person) 