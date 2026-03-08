const name = document.getElementById("name");
const username = name.innerText;
const disconnect = document.getElementById("disconnect");
const connect = document.getElementById("connect");
const back = document.getElementById("back");
const messages = document.getElementById("messages");
const send = document.getElementById("send");
const onlineUsersDiv = document.getElementById("onlineUsers");
const onlineCount = document.getElementById("onlineCount");
const typingIndicator = document.getElementById("typingIndicator");
const typingText = document.getElementById("typingText");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");

const socket = io();
let connectsocket = 0;
let onlineUsers = [];
let typingTimeout;

disconnect.disabled = true;

// Toast notification function
function showToast(message, icon = 'fa-bell', duration = 3000) {
    toastMessage.textContent = message;
    toastIcon.className = `fas ${icon}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Add message to chat
function addMessage(text, type = 'normal') {
    const p = document.createElement('p');
    p.className = `message ${type}`;
    p.innerHTML = text;
    messages.appendChild(p);
    messages.scrollTop = messages.scrollHeight;
    
    // Add animation class
    p.style.animation = 'messageSlide 0.3s ease';
}

// Format message with time
function formatMessage(text, sender = null, isOwn = false) {
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    if (sender) {
        return `
            <div class="message-sender">${sender}</div>
            <div>${text}</div>
            <div class="message-time">${time}</div>
        `;
    } else {
        return `
            <div>${text}</div>
            <div class="message-time">${time}</div>
        `;
    }
}

// Update online users list
function updateOnlineUsers() {
    onlineUsersDiv.innerHTML = '';
    onlineUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'online-user';
        userDiv.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${user}</span>
        `;
        onlineUsersDiv.appendChild(userDiv);
    });
    onlineCount.textContent = onlineUsers.length;
}

// Handle typing indicator
function handleTyping(isTyping, user) {
    if (isTyping) {
        typingText.textContent = `${user} is typing...`;
        typingIndicator.classList.add('active');
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingIndicator.classList.remove('active');
        }, 2000);
    } else {
        typingIndicator.classList.remove('active');
    }
}

// Socket event listeners
socket.on("connected-users", (username) => {
    if (!onlineUsers.includes(username)) {
        onlineUsers.push(username);
        updateOnlineUsers();
    }
    addMessage(formatMessage(`${username} has joined the broadcast 🌟`), 'system');
    showToast(`${username} joined the room`, 'fa-user-plus');
});

socket.on("user-connected", (data) => {
    if (!onlineUsers.includes(data.username)) {
        onlineUsers.push(data.username);
        updateOnlineUsers();
    }
    addMessage(formatMessage(`${data.username} has joined the broadcast 🌟`), 'system');
    showToast(`${data.username} joined`, 'fa-user-plus');
});

socket.on("user-disconnected", (data) => {
    onlineUsers = onlineUsers.filter(u => u !== data.username);
    updateOnlineUsers();
    addMessage(formatMessage(`${data.username} left the broadcast 🌙`), 'system');
    showToast(`${data.username} left`, 'fa-user-minus');
});

socket.on("disconnect-user", (disconnectmsg) => {
    const cleanMsg = disconnectmsg.replace(/[!.]/g, '');
    addMessage(formatMessage(`${cleanMsg} 🌙`), 'system');
});

socket.on("recieved-messsage", (msg) => {
    const [message, sender] = msg.split(' (');
    const cleanSender = sender ? sender.replace(')', '') : 'Unknown';
    addMessage(formatMessage(message, cleanSender), 'normal');
});

socket.on("user-typing", (data) => {
    handleTyping(data.isTyping, data.username);
});

// Connect button
connect.addEventListener("click", () => {
    socket.emit("connected", username);
    connectsocket = 1;
    connect.disabled = true;
    disconnect.disabled = false;
    
    addMessage(formatMessage(`You are now connected! Start broadcasting 🚀`), 'system');
    showToast('Connected successfully!', 'fa-check-circle');
    
    // Add current user to online list
    if (!onlineUsers.includes(username)) {
        onlineUsers.push(username);
        updateOnlineUsers();
    }
});

// Disconnect button
disconnect.addEventListener("click", () => {
    const disconnectmsg = `${username} is disconnected!`;
    socket.emit("disconnected", disconnectmsg);
    
    onlineUsers = onlineUsers.filter(u => u !== username);
    updateOnlineUsers();
    
    addMessage(formatMessage(`You disconnected from the broadcast 👋`), 'system');
    showToast('Disconnected', 'fa-power-off');
    
    setTimeout(() => {
        window.location.href = "/";
    }, 1000);
});

// Back button
back.addEventListener("click", () => {
    if (connectsocket == 1) {
        const disconnectmsg = `${username} is disconnected`;
        socket.emit("disconnected", disconnectmsg);
        showToast('Leaving broadcast...', 'fa-door-open');
    }
    
    setTimeout(() => {
        window.location.href = "/";
    }, 500);
});

// Send message
send.addEventListener("click", () => {
    if (connectsocket == 1) {
        const message = document.getElementById("message").value.trim();
        if (message === '') {
            showToast('Please enter a message', 'fa-exclamation-triangle');
            return;
        }
        
        const msg = `${message} (${username})`;
        socket.emit("send-message", msg);
        
        // Add own message to chat
        addMessage(formatMessage(message, 'You', true), 'own-message');
        
        document.getElementById("message").value = '';
        showToast('Message sent!', 'fa-paper-plane');
    } else {
        showToast('Please connect to chat!', 'fa-plug');
    }
});

// Typing indicator
let typingTimer;
document.getElementById("message").addEventListener("input", () => {
    if (connectsocket == 1) {
        socket.emit("typing", { isTyping: true, username });
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit("typing", { isTyping: false, username });
        }, 1000);
    }
});

// Enter key support
document.getElementById("message").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        send.click();
    }
});

// Get initial online users
socket.emit("get-online-users");

// Welcome message
setTimeout(() => {
    addMessage(formatMessage(`✨ Welcome to LuvToBroadcast, ${username}! Click Connect to start chatting.`), 'system');
}, 500);

// Handle page unload
window.addEventListener("beforeunload", () => {
    if (connectsocket == 1) {
        socket.emit("disconnected", `${username} is disconnected`);
    }
});

/*
const name = document.getElementById("name")
const username = name.innerText
const disconnect = document.getElementById("disconnect")
const connect = document.getElementById("connect")
const back = document.getElementById("back")
const messages = document.getElementById("messages")
const send = document.getElementById("send")
const socket = io();
let connectsocket = 0

disconnect.disabled = true


socket.on("connected-users", (username) => {
    let p = document.createElement("p")
    p.innerText = `${username} has joined (${new Date().toLocaleTimeString()})`  
    messages.appendChild(p)
})

connect.addEventListener("click",()=>{
    socket.emit("connected",(username))
    connectsocket = 1
    connect.disabled = true
    disconnect.disabled = false
})

back.addEventListener("click", () => {
    if(connectsocket == 1){
    const disconnectmsg = `${username} is disconnected (${new Date().toLocaleTimeString()})`
    socket.emit("disconnected", (disconnectmsg))
    window.location.href = "/"
    }
    else{
        window.location.href = "/"
    }
})


disconnect.addEventListener("click", () => {
    const disconnectmsg = `${username} is disconnected!`
    socket.emit("disconnected", (disconnectmsg))
    window.location.href = "/"
})


    socket.on("disconnect-user",(disconnectmsg)=>{
    let p = document.createElement("p")
    p.innerText = disconnectmsg 
    messages.appendChild(p)
})

send.addEventListener("click",()=>{
    if(connectsocket == 1){
        const message = document.getElementById("message").value
        const msg = `${message} (${username} - ${new Date().toLocaleTimeString()})`
        socket.emit("send-message",(msg))
    }
    else{
        alert("Please connect to chat!")
    }
})

socket.on("recieved-messsage",(msg)=>{
    let p = document.createElement("p")
    p.innerText = msg
    messages.appendChild(p)
})
*/








