import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const FilterBar = ({ 
  categories = [], 
  onFilterChange, 
  activeFilters = {},
  taskCounts = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters };
    
    if (newFilters[filterType] === value) {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value;
    }
    
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg mr-3">
            <ApperIcon name="Filter" size={18} className="text-white" />
          </div>
          Filters
        </h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-primary font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <ApperIcon name="X" size={14} />
              Clear all
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <ApperIcon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={18} 
            />
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-6">
          {/* Priority Filter */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <ApperIcon name="AlertTriangle" size={16} className="mr-2 text-warning" />
              Priority Level
            </h4>
            <div className="flex gap-2">
              {[
                { value: 'high', label: 'High', color: 'from-error to-red-500' },
                { value: 'medium', label: 'Medium', color: 'from-warning to-orange-500' },
                { value: 'low', label: 'Low', color: 'from-success to-green-500' }
              ].map(priority => (
                <motion.button
                  key={priority.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange('priority', priority.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilters.priority === priority.value
                      ? `bg-gradient-to-r ${priority.color} text-white shadow-lg`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {priority.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <ApperIcon name="Tag" size={16} className="mr-2 text-secondary" />
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <motion.button
                  key={category.Id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange('categoryId', category.Id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm ${
                    activeFilters.categoryId === category.Id
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  style={{
                    backgroundColor: activeFilters.categoryId === category.Id 
                      ? category.color 
                      : undefined
                  }}
                >
                  <ApperIcon name={category.icon} size={14} className="mr-2" />
                  {category.name}
                  {taskCounts[category.Id] !== undefined && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeFilters.categoryId === category.Id
                        ? 'bg-white bg-opacity-30'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {taskCounts[category.Id]}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <ApperIcon name="CheckCircle" size={16} className="mr-2 text-accent" />
              Task Status
            </h4>
            <div className="flex gap-2">
              {[
                { value: 'incomplete', label: 'Incomplete', icon: 'Circle' },
                { value: 'completed', label: 'Completed', icon: 'CheckCircle' }
              ].map(status => (
                <motion.button
                  key={status.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange('status', status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm ${
                    activeFilters.status === status.value
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <ApperIcon name={status.icon} size={14} className="mr-2" />
                  {status.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-600">Active Filters</h5>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {Object.keys(activeFilters).length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([filterType, value]) => {
              let displayValue = value;
              let icon = 'Filter';
              
              if (filterType === 'categoryId') {
                const category = categories.find(c => c.Id === value);
                displayValue = category?.name || value;
                icon = category?.icon || 'Tag';
              } else if (filterType === 'priority') {
                icon = 'AlertTriangle';
              } else if (filterType === 'status') {
                icon = value === 'completed' ? 'CheckCircle' : 'Circle';
              }
              
              return (
                <motion.div
                  key={`${filterType}-${value}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange(filterType, value)}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <ApperIcon name={icon} size={12} />
                  {displayValue}
                  <ApperIcon name="X" size={12} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FilterBar;