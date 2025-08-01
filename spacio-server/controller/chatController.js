// controller/chatController.js
const Chatroom = require("../model/chat-room");
const Project = require("../model/project");

exports.getMessagesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Chatroom.find({ projectId })
      .sort({ createdAt: 1 })
      .populate("senderId", "full_name")
      .populate("receiverId", "full_name");

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.sendMessageToRoom = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { projectId } = req.params;
    const { text } = req.body;
    const attachments = req.files?.map(file => `/chatUploads/${file.filename}`) || [];

    const project = await Project.findById(projectId);
    if (!project) {
      console.error(" Project not found:", projectId);
      return res.status(404).json({ error: "Project not found" });
    }

    // Determine receiver using client/designer fields
    let receiverId;
    if (project.client.toString() === senderId.toString()) {
      receiverId = project.designer;
    } else if (project.designer.toString() === senderId.toString()) {
      receiverId = project.client;
    } else {
      console.error(" Sender not part of this project.");
      return res.status(400).json({ error: "Sender not part of this project" });
    }

    const newMessage = new Chatroom({ senderId, receiverId, projectId, text, attachments });
    await newMessage.save();

    const populatedMessage = await Chatroom.findById(newMessage._id)
      .populate("senderId", "full_name")
      .populate("receiverId", "full_name");

    return res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(" Error sending message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


