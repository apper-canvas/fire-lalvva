import { motion } from 'framer-motion';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { taskService, categoryService } from '@/services';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const TaskItem = ({ task, onUpdate, onDelete, categories = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskCategory, setTaskCategory] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    categoryId: task.categoryId,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    completed: task.completed
  });

  useEffect(() => {
    const category = categories.find(cat => cat.Id === task.categoryId);
    setTaskCategory(category);
  }, [task.categoryId, categories]);

  useEffect(() => {
    setEditData({
      title: task.title,
      categoryId: task.categoryId,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      completed: task.completed
    });
  }, [task]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: task.title,
      categoryId: task.categoryId,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      completed: task.completed
    });
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        ...editData,
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null
      });
      onUpdate(updatedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleCompleted = async () => {
    setIsUpdating(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        completed: !task.completed
      });
      onUpdate(updatedTask);
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.info('Task marked as incomplete');
      }
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      await taskService.delete(task.Id);
      onDelete(task.Id);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };
  const getDueDateInfo = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return {
        text: `Overdue (${format(dueDate, 'MMM d')})`,
        className: 'text-error bg-error/10'
      };
    }
    
    if (isToday(dueDate)) {
      return {
        text: `Today (${format(dueDate, 'h:mm a')})`,
        className: 'text-warning bg-warning/10'
      };
    }
    
    if (isThisWeek(dueDate)) {
      return {
        text: format(dueDate, 'EEE, MMM d'),
        className: 'text-info bg-info/10'
      };
    }
    
    return {
      text: format(dueDate, 'MMM d, yyyy'),
      className: 'text-gray-600 bg-gray-100'
    };
  };

  const dueDateInfo = getDueDateInfo();

return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
        task.completed ? 'opacity-80' : ''
      }`}
    >
      {isEditing ? (
        <div className="space-y-4">
          {/* Edit Form */}
          <Input
            value={editData.title}
            onChange={(e) => handleEditChange('title', e.target.value)}
            placeholder="Task title"
            className="font-medium"
          />
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Select */}
            <select
              value={editData.categoryId}
              onChange={(e) => handleEditChange('categoryId', parseInt(e.target.value, 10))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category.Id} value={category.Id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Priority Select */}
            <select
              value={editData.priority}
              onChange={(e) => handleEditChange('priority', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Due Date Input */}
            <input
              type="datetime-local"
              value={editData.dueDate}
              onChange={(e) => handleEditChange('dueDate', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Completed Toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editData.completed}
                onChange={(e) => handleEditChange('completed', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">Completed</span>
            </label>
          </div>

          {/* Edit Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveEdit}
              disabled={!editData.title.trim() || isUpdating}
              loading={isUpdating}
              size="sm"
              icon="Check"
            >
              Save
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="ghost"
              size="sm"
              icon="X"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-gray-900 ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {/* Task Meta */}
                <div className="flex items-center gap-2 mt-2">
                  {/* Completed Status */}
                  {task.completed && (
                    <Badge variant="success" size="xs" icon="Check">
                      Completed
                    </Badge>
                  )}
                  
                  {/* Priority Badge */}
                  <Badge variant={task.priority} size="xs">
                    {task.priority}
                  </Badge>
                  
                  {/* Category Badge */}
                  {taskCategory && (
                    <Badge 
                      variant="default" 
                      size="xs"
                      icon={taskCategory.icon}
                      className="text-gray-600"
                      style={{ backgroundColor: `${taskCategory.color}20`, color: taskCategory.color }}
                    >
                      {taskCategory.name}
                    </Badge>
                  )}
                  
                  {/* Due Date */}
                  {dueDateInfo && (
                    <span className={`text-xs px-2 py-1 rounded-full ${dueDateInfo.className}`}>
                      {dueDateInfo.text}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                {/* Toggle Completed */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleCompleted}
                  disabled={isUpdating}
                  className={`p-1 transition-colors duration-200 ${
                    task.completed 
                      ? 'text-success hover:text-success/80' 
                      : 'text-gray-400 hover:text-success'
                  }`}
                  title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  <ApperIcon name={task.completed ? "CheckCircle" : "Circle"} size={16} />
                </motion.button>

                {/* Edit */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-primary transition-colors duration-200"
                  title="Edit task"
                >
                  <ApperIcon name="Edit2" size={16} />
                </motion.button>

                {/* Delete */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-error transition-colors duration-200"
                  title="Delete task"
                >
                  <ApperIcon name="Trash2" size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
{/* Update Ripple Effect */}
      {isUpdating && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-primary rounded-lg pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}
    </motion.div>
  );
};

export default TaskItem;