import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import ErrorState from "@/components/molecules/ErrorState";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import TaskList from "@/components/organisms/TaskList";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { categoryService, taskService } from "@/services/index";

const Archive = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => 
      prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      )
    );
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.Id !== taskId));
  };

  const handleRestoreTask = async (taskId) => {
    try {
      const updatedTask = await taskService.update(taskId, { completed: false });
      handleTaskUpdate(updatedTask);
      toast.success('Task restored to active list');
    } catch (error) {
      toast.error('Failed to restore task');
    }
  };

  const handleClearArchive = async () => {
    if (!window.confirm('Are you sure you want to delete all completed tasks? This action cannot be undone.')) {
      return;
    }

    try {
      const completedTasks = tasks.filter(t => t.completed);
      for (const task of completedTasks) {
        await taskService.delete(task.Id);
      }
      setTasks(prev => prev.filter(t => !t.completed));
      toast.success('Archive cleared successfully');
    } catch (error) {
      toast.error('Failed to clear archive');
    }
};

  const completedTasks = useMemo(() => {
    return tasks
      .filter(task => task.completed)
      .filter(task => {
        if (!searchQuery) return true;
        const searchText = task.Name || task.title || '';
        return searchText.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }, [tasks, searchQuery]);
const stats = useMemo(() => {
    const totalCompleted = tasks.filter(t => t.completed).length;
    const thisWeek = tasks.filter(t => {
      if (!t.completed) return false;
      const taskDate = new Date(t.created_at || t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    }).length;

    return { totalCompleted, thisWeek };
  }, [tasks]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Archive
          </h1>
          <p className="text-gray-600">Review your completed tasks</p>
        </div>
        <SkeletonLoader count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Archive
          </h1>
          <p className="text-gray-600">Review your completed tasks</p>
        </div>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ApperIcon name="Archive" size={28} className="text-primary" />
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Archive
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          Review your completed tasks and accomplishments
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-success/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <ApperIcon name="CheckCircle" size={20} className="text-success" />
              <span className="text-sm font-medium text-success">Total Completed</span>
            </div>
            <div className="text-2xl font-bold text-success">{stats.totalCompleted}</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <ApperIcon name="TrendingUp" size={20} className="text-primary" />
              <span className="text-sm font-medium text-primary">This Week</span>
            </div>
            <div className="text-2xl font-bold text-primary">{stats.thisWeek}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search completed tasks..."
            icon="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {completedTasks.length > 0 && (
          <Button
            variant="outline"
            icon="Trash2"
            onClick={handleClearArchive}
            className="text-error border-error hover:bg-error hover:text-white"
          >
            Clear Archive
          </Button>
        )}
      </div>

      {/* Task List */}
      <TaskList
        tasks={completedTasks}
        categories={categories}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        emptyStateProps={{
          title: searchQuery ? "No completed tasks match your search" : "No completed tasks yet",
          description: searchQuery 
            ? "Try adjusting your search terms" 
            : "Complete some tasks to see them here",
          icon: "Archive",
          actionLabel: searchQuery ? undefined : "Go to All Tasks"
        }}
      />
    </motion.div>
  );
};

export default Archive;