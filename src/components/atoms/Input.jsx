import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}, ref) => {
  const inputClasses = `w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
    error 
      ? 'border-error focus:ring-error' 
      : 'border-gray-300 focus:border-primary'
  } ${
    icon && iconPosition === 'left' ? 'pl-10' : ''
  } ${
    icon && iconPosition === 'right' ? 'pr-10' : ''
  } ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} size={16} className="text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} size={16} className="text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;