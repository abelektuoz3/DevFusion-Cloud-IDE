import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiLogOut,
  FiCode,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, api } = useAuth(); // Get api from context
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects"); // Use api instead of axios
      setProjects(response.data);
    } catch (error) {
      console.error("Load projects error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        navigate("/login");
      } else {
        toast.error("Failed to load projects");
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    try {
      const response = await api.post("/projects", {
        title: "Untitled Project",
        language: "javascript",
        code: "// Write your code here",
      });
      toast.success("Project created!");
      navigate(`/editor/${response.data._id}`);
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const deleteProject = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`))
      return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const openProject = (id) => {
    navigate(`/editor/${id}`);
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: "🟨",
      python: "🐍",
      java: "☕",
      cpp: "⚙️",
      csharp: "🔷",
    };
    return icons[language] || "📄";
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: "bg-yellow-100 text-yellow-800",
      python: "bg-blue-100 text-blue-800",
      java: "bg-red-100 text-red-800",
      cpp: "bg-purple-100 text-purple-800",
      csharp: "bg-green-100 text-green-800",
    };
    return colors[language] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FiCode className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DevFusion IDE</h1>
              <p className="text-xs text-gray-500">
                Welcome back, {user?.username}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all duration-300">
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage and organize your code projects
            </p>
          </div>
          <button
            onClick={createNewProject}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40">
            <FiPlus size={20} />
            <span>New Project</span>
          </button>
        </div>

        {loading ?
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 mt-4">Loading your projects...</p>
          </div>
        : projects.length === 0 ?
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <FiFolder className="text-4xl text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first project to get started coding!
            </p>
            <button
              onClick={createNewProject}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300">
              <FiPlus size={18} />
              <span>Create Your First Project</span>
            </button>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div
                  onClick={() => openProject(project._id)}
                  className="p-6 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getLanguageIcon(project.language)}
                      </span>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[120px]">
                        {project.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(project.language)}`}>
                      {project.language}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <code className="text-xs text-gray-600 line-clamp-2 font-mono">
                      {project.code?.substring(0, 60) || "// Empty project"}
                      {project.code?.length > 60 ? "..." : ""}
                    </code>
                  </div>

                  <div className="flex items-center text-xs text-gray-400">
                    <FiClock className="mr-1" size={12} />
                    <span>
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 flex justify-end space-x-2">
                  <button
                    onClick={() => openProject(project._id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                    title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project._id, project.title)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default Dashboard;
