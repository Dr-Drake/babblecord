const socket = io();

// when a user connects to the server
socket.on('connect', () => {
    let name = localStorage.getItem('bcordName');
    if (name) {
        socket.emit('join', name);
    }
    else{
        // prompt the user for their name and emit the "join" event
        name = prompt('Enter your name:');

        while(!name){
            name = prompt('Enter your name:');
        }
        localStorage.setItem('bcordName', name);
        socket.emit('join', name);
    }

});

// when the server emits the "updateUserList" event
socket.on('updateUserList', (users) => {
    // update the user count
    const userCount = document.getElementById('user-count');
    userCount.innerText = users.length;

    // update the user list
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    users.forEach((user) => {
        const p = document.createElement('p');
        p.innerText = user;
        userList.appendChild(p);
    });
});

// when the server emits the "userJoined" event
socket.on('userJoined', (name) => {
    // show the join notification
    const chatDisplay = document.getElementById("chat-display");
    const joinNotification = document.createElement('p');
    joinNotification.className = 'text-gray-600 text-xl lg:text-sm text-center';
    joinNotification.innerHTML = `
        <span class="mr-3">👤</span>${name} has joined the chatroom.
    `
    chatDisplay.appendChild(joinNotification);
});

// when the server emits the "chatMessage" event
socket.on('chatMessage', (data) => {
    const chatDisplay = document.getElementById("chat-display");

    // determine if the message is from the current user or another user
    const isCurrentUser = data.username === localStorage.getItem('bcordName');

    // create the chat bubble
    const chatBubbleOther = document.createElement('div');
    chatBubbleOther.className = "flex justify-start my-5% lg:my-3";
    chatBubbleOther.innerHTML = `
        <div class="bg-gray-200 rounded-lg px-4 py-2 lg:max-w-lg">
            <p class="text-2xl lg:text-xs text-chat-dark-blue mb-3">${data.username} <span>${data.time}</span></p>
            <p class="text-4xl lg:text-sm leading-normal">${data.message}</p>
        </div>
    `
    const chatBubbleYou = document.createElement('div');
    chatBubbleYou.className = "flex justify-end my-5% lg:my-3";
    chatBubbleYou.innerHTML = `
        <div class="bg-blue-500 rounded-lg px-4 py-2 lg:max-w-lg">
            <p class="text-2xl lg:text-xs text-bubble-blue mb-3">${data.username} <span>${data.time}</span></p>
            <p class="text-4xl lg:text-sm text-white leading-normal">${data.message}</p>
        </div>
    `

    // append the chat bubble to the appropriate chat display
    chatDisplay.appendChild(isCurrentUser ? chatBubbleYou : chatBubbleOther);

    // Scroll to bottom if necessary
   
    chatDisplay.scroll({
        top: chatDisplay.scrollHeight,
        behavior: 'smooth'
    });
});

// When a user disconnects
socket.on('userDisconnect', (name) => {
    // show the join notification
    const chatDisplay = document.getElementById("chat-display");
    const joinNotification = document.createElement('p');
    joinNotification.className = 'text-gray-600 text-xl lg:text-sm text-center';
    joinNotification.innerHTML = `
        <span class="mr-3">👤</span>${name} has left the chatroom.
    `
    chatDisplay.appendChild(joinNotification);
});

// when the user submits the chat form
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // get the message input value
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    // emit the "chatMessage" event
    const username = localStorage.getItem('bcordName');
    const time = new Date().toLocaleTimeString();
    const data = { username, message, time };
    console.log(data)
    socket.emit('message', data);

    // clear the message input
    messageInput.value = '';
});