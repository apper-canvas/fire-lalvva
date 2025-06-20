import { useContext } from 'react';
import { AuthContext } from '@/App';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-800 border-gray-300"
    >
      <ApperIcon name="LogOut" size={16} className="mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;