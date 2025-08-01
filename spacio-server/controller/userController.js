const User = require("../model/user");
const path = require("path");
const fs = require("fs");

// Get all designers
const getAllDesigners = async (req, res) => {
    try {
        const designers = await User.find({ role: "designer" }).select("-password");
        res.status(200).json(designers);
    } catch (error) {
        // console.error("Error fetching designers:", error);
        res.status(500).json({ message: "Failed to fetch designers" });
    }
};

// Get designers by style/specialization
const getDesignersByStyle = async (req, res) => {
    try {
        const { style } = req.params;

        console.log(` Searching for designers with style: ${style}`);

        // Create a case-insensitive regex pattern for the style
        const styleRegex = new RegExp(style, 'i');

        // Find designers whose specialization matches the requested style
        const designers = await User.find({
            role: "designer",
            specialization: { $regex: styleRegex }
        }).select("-password");


        // Log what specializations we found
        designers.forEach(designer => {
            // console.log(` ${designer.full_name}: specialization = "${designer.specialization}"`);
        });

        res.status(200).json({
            style: style,
            count: designers.length,
            designers: designers
        });
    } catch (error) {
        // console.error("Error fetching designers by style:", error);
        res.status(500).json({ message: "Failed to fetch designers by style" });
    }
};

// Get a specific user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        // console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { full_name, bio, specialization, experience, preferredTones, approach } = req.body;

        if (full_name) user.full_name = full_name;
        if (bio) user.bio = bio;
        if (specialization) user.specialization = specialization;
        if (experience) user.experience = Number(experience);
        if (approach) user.approach = approach;

        if (req.body.preferredTones) {
            user.preferredTones = Array.isArray(preferredTones) ? preferredTones : [preferredTones];
        }

        if (req.file) user.profilepic = `/profile_pics/${req.file.filename}`;

        await user.save();

        return res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
        // console.error("Update error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};


// Search designers by name or specialization
const searchDesigners = async (req, res) => {
    try {
        const { query } = req.params;

        // console.log(` Searching designers with query: ${query}`);

        // Case-insensitive regex for both full_name and specialization
        const regex = new RegExp(query, 'i');

        const designers = await User.find({
            role: "designer",
            $or: [
                { full_name: { $regex: regex } },
                { specialization: { $regex: regex } }
            ]
        }).select("-password");

        // console.log(` Found ${designers.length} designers matching query: "${query}"`);

        res.status(200).json({
            query: query,
            count: designers.length,
            designers: designers
        });
    } catch (error) {
        // console.error("Error searching designers:", error);
        res.status(500).json({ message: "Failed to search designers" });
    }
};

const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        // console.error(" Error fetching user profile:", err);
        res.status(500).json({ message: "Failed to load profile" });
    }
};

const updateDesignerProfile = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { ...req.body },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found" });

        res.status(200).json(updated);
    } catch (err) {
        // console.error(" Error updating profile:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

module.exports = {
    getAllDesigners,
    getDesignersByStyle,
    getUserById,
    updateUserProfile,
    searchDesigners, getCurrentUserProfile,
    updateDesignerProfile,
};