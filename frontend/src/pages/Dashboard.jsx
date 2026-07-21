// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiCode,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiClock,
  FiCpu,
  FiTerminal,
  FiDatabase,
  FiFile,
  FiBox,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import DashboardNavbar from "../components/layout/DashboardNavbar";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, api } = useAuth();
  const {
    workspaces = [],
    loadWorkspaces,
    createWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadWorkspaces();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data || []);
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

  const openWorkspace = (id) => {
    navigate(`/workspace/${id}`);
  };

  const createNewWorkspace = async () => {
    const name = window.prompt("Enter workspace name:");
    if (!name) return;

    try {
      const workspace = await createWorkspace({ name, description: "" });
      if (workspace) {
        navigate(`/workspace/${workspace._id}`);
      }
    } catch (error) {
      toast.error("Failed to create workspace");
    }
  };

  const deleteWorkspaceHandler = async (id, name) => {
    if (
      !window.confirm(
        `Delete workspace "${name}"? This action cannot be undone.`,
      )
    )
      return;
    const success = await deleteWorkspace(id);
    if (success) {
      await loadWorkspaces();
    }
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: <FiCode className="text-yellow-500" size={20} />,
      python: <FiTerminal className="text-blue-500" size={20} />,
      java: <FiCpu className="text-red-500" size={20} />,
      cpp: <FiDatabase className="text-purple-500" size={20} />,
      csharp: <FiBox className="text-green-500" size={20} />,
    };
    return icons[language] || <FiFile className="text-gray-400" size={20} />;
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
      python:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      java: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
      cpp: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      csharp:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    };
    return (
      colors[language] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  // Safely get projects array
  const projectsList = Array.isArray(projects) ? projects : [];
  const workspacesList = Array.isArray(workspaces) ? workspaces : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ✅ DashboardNavbar - Fetched from DashboardNavbar.jsx */}
      <DashboardNavbar projectCount={projectsList.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Projects Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Projects
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading your projects...
            </p>
          </div>
        : projectsList.length === 0 ?
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <FiFolder className="text-4xl text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
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
            {projectsList.map((project) => (
              <div
                key={project._id}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-xl dark:hover:shadow-indigo-900/20 transition-all duration-300 overflow-hidden">
                <div
                  onClick={() => openProject(project._id)}
                  className="p-6 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {getLanguageIcon(project.language)}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {project.title}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getLanguageColor(project.language)}`}>
                      {project.language}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                    <code className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 font-mono">
                      {project.code?.substring(0, 60) || "// Empty project"}
                      {project.code?.length > 60 ? "..." : ""}
                    </code>
                  </div>

                  <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <FiClock className="mr-1" size={12} />
                    <span>
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end space-x-2">
                  <button
                    onClick={() => openProject(project._id)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-300"
                    title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProject(project._id, project.title)}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300"
                    title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        }

        {/* Workspaces Section */}
        <div className="mt-12 border-t border-gray-200 dark:border-slate-700 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Workspaces
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Organize your code in workspaces with folders and files
              </p>
            </div>
            <button
              onClick={createNewWorkspace}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40">
              <FiPlus size={20} />
              <span>New Workspace</span>
            </button>
          </div>

          {workspacesList.length === 0 ?
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
              <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <FiFolder className="text-4xl text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No workspaces yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create a workspace to organize your projects
              </p>
              <button
                onClick={createNewWorkspace}
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300">
                <FiPlus size={18} />
                <span>Create Workspace</span>
              </button>
            </div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspacesList.map((workspace) => (
                <div
                  key={workspace._id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300 overflow-hidden">
                  <div
                    onClick={() => openWorkspace(workspace._id)}
                    className="p-6 cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <FiFolder className="text-yellow-500" size={24} />
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {workspace.name}
                      </h3>
                    </div>
                    {workspace.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                        {workspace.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 space-x-4">
                      <span className="flex items-center space-x-1">
                        <FiCode size={12} />
                        <span>{workspace.owner?.username || "Unknown"}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiFile size={12} />
                        <span>{workspace.fileCount || 0} files</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FiClock size={12} />
                        <span>
                          {new Date(workspace.updatedAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 flex justify-end space-x-2">
                    <button
                      onClick={() => openWorkspace(workspace._id)}
                      className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                      Open
                    </button>
                    <button
                      onClick={() =>
                        deleteWorkspaceHandler(workspace._id, workspace.name)
                      }
                      className="px-4 py-1.5 text-sm bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
