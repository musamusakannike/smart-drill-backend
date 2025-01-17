const Community = require("../models/community.model");
const Message = require("../models/message.model");

const createCommunity = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ status: "error", message: "Name and description are required." });
  }

  try {
    const community = new Community({
      name,
      description,
      createdBy: req.user._id, // Assuming the authenticated user is an admin
    });

    await community.save();

    res.json({
      status: "success",
      message: "Community created.",
      data: { community },
    });
  } catch (error) {
    console.error("Error creating community:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const getCommunities = async (req, res) => {
  try {
    // Fetch all communities
    const communities = await Community.find()
      .populate("createdBy", "fullname")
      .select("-members");

    const userId = req.user._id;

    // Fetch user's joined communities
    const joinedCommunities = await Community.find({
      members: userId,
    }).populate("createdBy", "fullname");

    // Fetch communities the user has not joined
    const otherCommunities = await Community.find({
      members: { $ne: userId },
    }).populate("createdBy", "fullname");

    res.json({
      status: "success",
      data: { joinedCommunities, otherCommunities },
    });
  } catch (error) {
    console.error("Error fetching communities:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const joinCommunity = async (req, res) => {
  const { communityId } = req.params;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    if (community.members.includes(req.user._id)) {
      return res.status(400).json({
        status: "error",
        message: "You are already a member of this community.",
      });
    }

    community.members.push(req.user._id);
    await community.save();

    res.json({ status: "success", message: "You have joined the community." });
  } catch (error) {
    console.error("Error joining community:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const postMessage = async (req, res) => {
  const { communityId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ status: "error", message: "Message cannot be empty." });
  }

  try {
    // Check if the community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    // Check if the user is a member of the community
    if (!community.members.includes(req.user._id)) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member to post in this community.",
      });
    }

    // Create a new message in the Message model
    const newMessage = new Message({
      community: communityId,
      sender: req.user._id,
      message,
    });

    // Save the message to the database
    await newMessage.save();

    res.json({
      status: "success",
      message: "Message posted successfully.",
      data: { message: newMessage },
    });
  } catch (error) {
    console.error("Error posting message:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

const getCommunityMessages = async (req, res) => {
  const { communityId } = req.params;

  try {
    const community = await Community.findById(communityId).populate(
      "createdBy",
      "fullname"
    );
    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    const messages = await Message.find({ community: communityId })
      .populate("sender", "fullname")
      .sort({ createdAt: 1 }); // Sort messages by creation time in ascending order

    res.json({
      status: "success",
      data: {
        community,
        messages,
      },
    });
  } catch (error) {
    console.error("Error fetching community messages:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

// Fetch All Communities without sorting
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate(
      "createdBy",
      "fullname"
    );
    res.json({ status: "success", data: { communities } });
  } catch (error) {
    console.error("Error fetching communities:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

// Delete a Community
const deleteCommunity = async (req, res) => {
  const { communityId } = req.params;

  try {
    const community = await Community.findByIdAndDelete(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    res.json({ status: "success", message: "Community deleted successfully." });
  } catch (error) {
    console.error("Error deleting community:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

// Edit Community Details
const editCommunity = async (req, res) => {
  const { communityId } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ status: "error", message: "Name and description are required." });
  }

  try {
    const community = await Community.findByIdAndUpdate(
      communityId,
      { name, description },
      { new: true }
    );

    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    res.json({
      status: "success",
      message: "Community updated successfully.",
      data: { community },
    });
  } catch (error) {
    console.error("Error editing community:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  joinCommunity,
  postMessage,
  getCommunityMessages,
  getAllCommunities,
  deleteCommunity,
  editCommunity,
};
