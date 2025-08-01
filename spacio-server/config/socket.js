const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // userId: socketId

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) userSocketMap[userId] = socket.id;

        console.log(`User ${userId} connected as ${socket.id}`);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("joinRoom", ({ projectId }) => {
            socket.join(projectId);
            console.log(`User ${userId} joined project room ${projectId}`);
        });

        socket.on("sendMessage", ({ projectId, message }) => {
            io.to(projectId).emit("receiveMessage", message);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    console.log('Socket.IO initialized and listening');
    return { io, getReceiverSocketId };
}

function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

module.exports = initializeSocket;