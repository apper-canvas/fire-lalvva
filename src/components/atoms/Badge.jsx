import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  icon,
  className = '',
  ...props 
}) => {
const baseClasses = 'inline-flex items-center font-medium rounded-lg shadow-sm transition-all duration-200';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-md',
    secondary: 'bg-gradient-to-r from-secondary to-primary text-white hover:shadow-md',
    success: 'bg-gradient-to-r from-success to-green-500 text-white hover:shadow-md',
    warning: 'bg-gradient-to-r from-warning to-orange-500 text-white hover:shadow-md',
    error: 'bg-gradient-to-r from-error to-red-500 text-white hover:shadow-md',
    high: 'bg-gradient-to-r from-error to-red-500 text-white hover:shadow-md',
    medium: 'bg-gradient-to-r from-warning to-orange-500 text-white hover:shadow-md',
    low: 'bg-gradient-to-r from-success to-green-500 text-white hover:shadow-md'
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm'
  };

  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={badgeClasses} {...props}>
      {icon && (
        <ApperIcon name={icon} size={12} className="mr-1" />
      )}
      {children}
    </span>
  );
};

export default Badge;