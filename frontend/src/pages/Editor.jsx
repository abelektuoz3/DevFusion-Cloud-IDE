import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  FiPlay,
  FiSave,
  FiArrowLeft,
  FiTrash2,
  FiCode,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import { useTheme } from "../context/ThemeContext";

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const { isDark } = useTheme();

  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("Untitled Project");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executionStatus, setExecutionStatus] = useState("idle");

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}`);
      const project = response.data;
      setCode(project.code || "// Write your code here");
      setLanguage(project.language || "javascript");
      setTitle(project.title || "Untitled Project");
    } catch (error) {
      toast.error("Failed to load project");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectData = { title, language, code };

      let response;
      if (projectId) {
        response = await api.put(`/projects/${projectId}`, projectData);
        toast.success("Project saved!");
      } else {
        response = await api.post("/projects", projectData);
        toast.success("Project created!");
        navigate(`/editor/${response.data._id}`);
      }
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setExecutionStatus("running");
    setOutput("⏳ Executing code...");

    try {
      const response = await api.post("/run", {
        language,
        code,
      });

      if (response.data.success) {
        let outputText = response.data.output || "✅ No output";

        // Clean up the output
        if (outputText.includes("undefined")) {
          outputText = outputText.replace(/undefined/g, "");
        }

        outputText = outputText.trim();

        setOutput(outputText);
        setExecutionStatus("success");
        toast.success("Code executed successfully!");
      } else if (response.data.error) {
        setOutput(`❌ Error:\n${response.data.error}`);
        setExecutionStatus("error");
        toast.error("Execution failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Execution failed";
      setOutput(
        `❌ Error:\n${errorMessage}\n\n💡 ${error.response?.data?.details || "Please try again later"}`,
      );
      setExecutionStatus("error");
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project permanently?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const getLanguageIcon = () => {
    const icons = {
      javascript: "🟨",
      python: "🐍",
      java: "☕",
      cpp: "⚙️",
      csharp: "🔷",
    };
    return icons[language] || "📄";
  };

  // Update status message for all languages
  const getStatusMessage = () => {
    const messages = {
      javascript: "✅ Executing with Piston (Node.js)",
      python: "✅ Executing with Piston (Python)",
      java: "✅ Executing with Piston (Java)",
      cpp: "✅ Executing with Piston (C++/GCC)",
      csharp: "✅ Executing with Piston (C#/.NET)",
    };
    return messages[language] || "⚠️ Language not configured";
  };

  // Just change the language - keep the code as-is
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // NO code changes - just update the language for syntax highlighting
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-10 shadow-sm dark:shadow-slate-900/50">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="Back to Dashboard">
          <FiArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>

        <span className="text-xl">{getLanguageIcon()}</span>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[150px] px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Project Title"
        />

        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="javascript">JavaScript ✅</option>
          <option value="python">Python ✅</option>
          <option value="java">Java ✅</option>
          <option value="cpp">C++ ✅</option>
          <option value="csharp">C# ✅</option>
        </select>

        <div className="flex items-center space-x-2 ml-auto">
          <DarkModeToggle />
          {projectId && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
              title="Delete Project">
              <FiTrash2 size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium">
            <FiSave size={16} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-4 py-1.5 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium ${
              isRunning ? "bg-yellow-500" : "bg-indigo-600 hover:bg-indigo-700"
            }`}>
            {isRunning ?
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Running...</span>
              </>
            : <>
                <FiPlay size={16} />
                <span>Run</span>
              </>
            }
          </button>
        </div>
      </div>

      {/* Language Status Bar */}
      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-1.5 border-b border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>{getStatusMessage()}</span>
        <span>
          {executionStatus === "success" && "✅ Last run: Success"}
          {executionStatus === "error" && "❌ Last run: Failed"}
          {executionStatus === "idle" && "📝 Ready"}
        </span>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Editor */}
        <div className="flex-1 h-[50vh] lg:h-auto border-r border-gray-200 dark:border-slate-700">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={isDark ? "vs-dark" : "vs-light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              fontFamily: "JetBrains Mono, monospace",
              lineNumbers: "on",
              renderWhitespace: "selection",
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: {
                enabled: true,
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
            }}
          />
        </div>

        {/* Output Console */}
        <div className="lg:w-1/3 h-[50vh] lg:h-auto bg-gray-50 dark:bg-slate-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-700 flex flex-col">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Output Console
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">{language}</span>
              {executionStatus === "success" && (
                <FiCheckCircle className="text-green-500" size={16} />
              )}
              {executionStatus === "error" && (
                <FiXCircle className="text-red-500" size={16} />
              )}
              {executionStatus === "running" && (
                <FiLoader className="animate-spin text-yellow-500" size={16} />
              )}
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap bg-gray-900 text-gray-100">
            {output ?
              <div className="text-gray-100">{output}</div>
            : <div className="text-gray-500 italic">
                <FiCode className="inline mr-2" />
                Run your code to see output here
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
