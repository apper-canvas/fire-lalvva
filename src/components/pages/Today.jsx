import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import TaskList from '@/components/organisms/TaskList';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { taskService, categoryService } from '@/services';
import { toast } from 'react-toastify';

const Today = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const todayTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter(task => {
if (!task.due_date && !task.dueDate) return false;
      const taskDate = new Date(task.due_date || task.dueDate);
      return isToday(taskDate);
    }).sort((a, b) => {
      // Sort by priority (high first), then by due time
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
return new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate);
    });
  }, [tasks]);

  const stats = useMemo(() => {
    const completed = todayTasks.filter(t => t.completed).length;
    const total = todayTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [todayTasks]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Today
          </h1>
          <p className="text-gray-600">Focus on what matters today</p>
        </div>
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Today
          </h1>
          <p className="text-gray-600">Focus on what matters today</p>
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
          <ApperIcon name="Calendar" size={28} className="text-primary" />
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Today
          </h1>
        </div>
        <p className="text-gray-600 mb-4">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>

        {/* Progress Overview */}
        {todayTasks.length > 0 && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-white mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Today's Progress</span>
              <span className="text-lg font-bold">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-white h-2 rounded-full"
              />
            </div>
            <div className="text-sm opacity-90">
              {stats.completed} of {stats.total} tasks completed
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <TaskList
        tasks={todayTasks}
        categories={categories}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        emptyStateProps={{
          title: "No tasks scheduled for today",
          description: "Enjoy your free day or add some tasks to stay productive",
          icon: "Calendar",
          actionLabel: "Add Task for Today"
        }}
      />
    </motion.div>
  );
};

export default Today;