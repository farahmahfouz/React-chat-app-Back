const { Server: SocketIOServer } = require("socket.io");
const Message = require("./Models/messageModel.js");
const Channel = require("./Models/channelModel.js");

exports.setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: 'https://react-chat-app-ten-flame.vercel.app',
      methods: "GET,POST",
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client disconnected: ${socket.id}`);

    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recieverSocketId = userSocketMap.get(message.reciever);

    const createMessage = await Message.create(message);

    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email firstName lastName color")
      .populate("reciever", "id email firstName lastName color");

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileURL } = message;
    
    const createMessage = await Message.create({
      sender,
      reciever: null,
      content,
      messageType,
      timestamp: new Date(),
      fileURL,
    });
    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createMessage._id },
    });

    const channel = await Channel.findById(channelId)
      .populate("members")
      .populate("admin");

    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });

      if (channel.admin) {
        const adminSocketId = userSocketMap.get(channel.admin[0]._id + '');
        if (adminSocketId) {
          io.to(adminSocketId).emit("recieve-channel-message", finalData);
        }
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log(`User ID not providing during connection.`);
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnect(socket));
  });
};
