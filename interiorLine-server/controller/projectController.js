const Project = require("../model/project");
const Chatroom = require("../model/chat-room");
const Notification = require("../model/user-notification");

const createProject = async (req, res) => {
  try {
    const client = req.user._id;
    const {
      title,
      description,
      designer,
      room_dimensions,
      room_type,
      style_preferences,
      color_palette,
      payment,
      reference_images,
      start_date,
      end_date,
      is_public
    } = req.body;

    const newProject = new Project({
      title,
      description,
      client,
      designer,
      room_dimensions,
      room_type,
      style_preferences,
      color_palette,
      payment,
      reference_images,
      start_date,
      end_date,
      is_public
    });
    await newProject.save();
    await new Chatroom({
      senderId: client,
      receiverId: designer,
      projectId: newProject._id,
      text: `Chat room initialized for project "${title}".`,
      attachments: [],
      read_by: [client]
    }).save();

    await new Notification({
      user: designer,
      title: "New Project Assigned",
      message: `You have been assigned a new project titled "${title}".`,
      type: "project_update",
      related_entity: {
        entity_type: "project",
        entity_id: newProject._id
      }
    }).save();
    res.status(201).json({
      message: "Project created successfully",
      project: newProject
    });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let projects;
    if (userRole === "designer") {
      projects = await Project.find({ designer: userId });
    } else {
      projects = await Project.find({ client: userId });
    }

    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Update Room Details with Image Uploads
const updateProjectRoomDetails = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const room_images = req.files.map(file => file.filename);

    const project = await Project.findByIdAndUpdate(
      projectId,
      { room_images },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    console.error("❌ Error updating room details:", err);
    res.status(500).json({ message: "Failed to update room details" });
  }
};

// Designer Stats
const getDesignerStats = async (req, res) => {
  try {
    const designerId = req.user._id;
    const projects = await Project.find({ designer: designerId });

    const totalClients = new Set(projects.map(p => p.client?.toString())).size;
    const revenueThisMonth = projects.reduce((sum, p) => sum + (p.payment || 0), 0);

    res.status(200).json({
      totalClients,
      revenueThisMonth,
      averageRating: 4.5,
      totalReviews: 0
    });
  } catch (err) {
    console.error("❌ Error fetching designer stats:", err);
    res.status(500).json({ message: "Failed to get designer stats" });
  }
};

// Performance (Placeholder)
const getDesignerPerformance = async (req, res) => {
  try {
    const designerId = req.user._id;
    const completed = await Project.countDocuments({ designer: designerId, status: "completed" });
    const total = await Project.countDocuments({ designer: designerId });

    res.status(200).json({
      completionRate: total ? ((completed / total) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error("❌ Error fetching performance:", err);
    res.status(500).json({ message: "Failed to get performance" });
  }
};

// Revenue (Placeholder)
const getProjectRevenue = async (req, res) => {
  try {
    const designerId = req.user._id;
    const projects = await Project.find({ designer: designerId });

    const totalRevenue = projects.reduce((sum, p) => sum + (p.payment || 0), 0);
    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.error("❌ Error calculating revenue:", err);
    res.status(500).json({ message: "Failed to calculate revenue" });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  updateProjectStatus,
  updateProjectRoomDetails,
  getDesignerStats,
  getDesignerPerformance,
  getProjectRevenue
};
