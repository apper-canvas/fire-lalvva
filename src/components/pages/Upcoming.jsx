import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, isAfter, isToday, startOfDay, addDays } from 'date-fns';
import TaskList from '@/components/organisms/TaskList';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { taskService, categoryService } from '@/services';
import { toast } from 'react-toastify';

const Upcoming = () => {
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

  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return tasks.filter(task => {
if (!task.due_date && !task.dueDate) return false;
      const taskDate = startOfDay(new Date(task.due_date || task.dueDate));
      return isAfter(taskDate, today);
    }).sort((a, b) => {
return new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate);
    });
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    
    upcomingTasks.forEach(task => {
const taskDate = startOfDay(new Date(task.due_date || task.dueDate));
      const dateKey = format(taskDate, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: taskDate,
          tasks: []
        };
      }
      
      groups[dateKey].tasks.push(task);
    });

    return Object.values(groups).sort((a, b) => a.date - b.date);
  }, [upcomingTasks]);

  const getDateLabel = (date) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    }
    
    return format(date, 'EEEE, MMMM d');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Upcoming
          </h1>
          <p className="text-gray-600">Stay ahead with your upcoming tasks</p>
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
            Upcoming
          </h1>
          <p className="text-gray-600">Stay ahead with your upcoming tasks</p>
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
          <ApperIcon name="Clock" size={28} className="text-primary" />
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Upcoming
          </h1>
        </div>
        <p className="text-gray-600">
          Stay ahead with your upcoming tasks
        </p>
        
        {upcomingTasks.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{upcomingTasks.length}</span> tasks scheduled
          </div>
        )}
      </div>

      {/* Grouped Tasks */}
      {groupedTasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <TaskList
            tasks={[]}
            categories={categories}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            emptyStateProps={{
              title: "No upcoming tasks",
              description: "All caught up! Your future is looking clear.",
              icon: "Clock",
              actionLabel: "Add Future Task"
            }}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTasks.map((group, groupIndex) => (
            <motion.div
              key={format(group.date, 'yyyy-MM-dd')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getDateLabel(group.date)}
                </h2>
                <div className="text-sm text-gray-500">
                  {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Tasks for this date */}
              <TaskList
                tasks={group.tasks}
                categories={categories}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Upcoming;