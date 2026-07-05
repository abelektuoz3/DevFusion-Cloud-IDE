// controllers/searchController.js
const File = require("../models/File");
const Workspace = require("../models/Workspace");

// @desc    Search files in workspace
// @route   GET /api/search
// @access  Private
exports.searchFiles = async (req, res) => {
  try {
    const { q, workspaceId } = req.query;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: "Search term must be at least 2 characters" });
    }

    // Check workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember && !workspace.isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Search files
    const files = await File.find({
      workspace: workspaceId,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    })
      .populate("folder", "name path")
      .select("name path folder content size updatedAt")
      .limit(50);

    // Highlight matches in content
    const results = files.map((file) => {
      const contentPreview =
        file.content.length > 200 ?
          file.content.substring(0, 200) + "..."
        : file.content;

      return {
        ...file.toJSON(),
        contentPreview,
        matches: countMatches(file.content, q),
      };
    });

    res.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

function countMatches(text, query) {
  const regex = new RegExp(query, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
