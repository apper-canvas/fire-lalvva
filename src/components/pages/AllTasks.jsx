import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import TaskList from '@/components/organisms/TaskList';
import FilterBar from '@/components/molecules/FilterBar';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { taskService, categoryService } from '@/services';
import { toast } from 'react-toastify';

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

// Category filter
      if (filters.categoryId && (task.category_id || task.categoryId) !== filters.categoryId) {
        return false;
      }

      // Status filter
      if (filters.status) {
        const isCompleted = task.completed;
        if (filters.status === 'completed' && !isCompleted) return false;
        if (filters.status === 'incomplete' && isCompleted) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const taskCounts = useMemo(() => {
    const counts = {};
    tasks.forEach(task => {
if (!task.completed) {
        const categoryId = task.category_id || task.categoryId;
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            All Tasks
          </h1>
          <p className="text-gray-600">Manage all your tasks in one place</p>
        </div>
        <SkeletonLoader count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            All Tasks
          </h1>
          <p className="text-gray-600">Manage all your tasks in one place</p>
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
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          All Tasks
        </h1>
        <p className="text-gray-600">
          Manage all your tasks in one place
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>
            Total: <span className="font-medium text-gray-900">{tasks.length}</span>
          </span>
          <span>
            Completed: <span className="font-medium text-success">
              {tasks.filter(t => t.completed).length}
            </span>
          </span>
          <span>
            Remaining: <span className="font-medium text-primary">
              {tasks.filter(t => !t.completed).length}
            </span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        categories={categories}
        onFilterChange={setFilters}
        activeFilters={filters}
        taskCounts={taskCounts}
      />

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        categories={categories}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        emptyStateProps={{
          title: Object.keys(filters).length > 0 ? "No tasks match your filters" : "No tasks yet",
          description: Object.keys(filters).length > 0 
            ? "Try adjusting your filters to see more tasks" 
            : "Create your first task to get started",
          icon: Object.keys(filters).length > 0 ? "Filter" : "CheckSquare"
        }}
      />
    </motion.div>
  );
};

export default AllTasks;