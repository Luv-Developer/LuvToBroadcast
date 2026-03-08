require("dotenv").config()
const express = require("express")
const app = express()
const PORT = process.env.PORT || 5000
const path = require("path")
const http = require("http")
const {Server} = require("socket.io")
const server = http.createServer(app)
const io = new Server(server)


let onlineUsers = [];


// socket io configuration
io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user connection
    socket.on('connected', (username) => {
        if (!onlineUsers.includes(username)) {
            onlineUsers.push(username);
        }
        
        // Notify all clients about new user
        io.emit('user-connected', { username });
        
        // Send current online users to the new user
        socket.emit('connected-users', username);
        
        console.log(`${username} connected`);
    });

    // Handle disconnection
    socket.on('disconnected', (disconnectmsg) => {
        const username = disconnectmsg.split(' ')[0];
        onlineUsers = onlineUsers.filter(u => u !== username);
        
        // Notify all clients about disconnection
        io.emit('user-disconnected', { username });
        io.emit('disconnect-user', disconnectmsg);
        
        console.log(`${username} disconnected`);
    });

    // Handle messages
    socket.on('send-message', (msg) => {
        io.emit('recieved-messsage', msg);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        socket.broadcast.emit('user-typing', data);
    });

    // Get online users
    socket.on('get-online-users', () => {
        socket.emit('online-users', onlineUsers);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}))



// Routes
app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/broadcast/:name",(req,res)=>{
    let name = req.params.name
    return res.render("broadcast",{name})
})

app.get("/broadcast",(req,res)=>{
    res.send("")
})



server.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`)
})