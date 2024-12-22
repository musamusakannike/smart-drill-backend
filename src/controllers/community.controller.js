const Chat = require("../models/chat.model");
const Community = require("../models/community.model");

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
    const joinedCommunities = await Community.find({ members: userId })
      .populate("createdBy", "fullname")

    // Fetch communities the user has not joined
    const otherCommunities = await Community.find({ members: { $ne: userId } })
      .populate("createdBy", "fullname")
      .select("-members");

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
    const community = await Community.findById(communityId);
    if (!community) {
      return res
        .status(404)
        .json({ status: "error", message: "Community not found." });
    }

    if (!community.members.includes(req.user._id)) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member to post in this community.",
      });
    }

    const chat = new Chat({
      communityId,
      userId: req.user._id,
      message,
    });

    await chat.save();

    res.json({ status: "success", message: "Message posted.", data: { chat } });
  } catch (error) {
    console.error("Error posting message:", error.message);
    res.status(500).json({ status: "error", message: "Server error." });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  joinCommunity,
  postMessage,
};
