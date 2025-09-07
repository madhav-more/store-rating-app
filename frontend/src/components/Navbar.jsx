import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Star, 
  Shield, 
  Store,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 }
        ];
      case 'user':
        return [
          { path: '/user/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/stores', label: 'Stores', icon: Store },
        ];
      case 'storeOwner':
        return [
          { path: '/store/dashboard', label: 'Dashboard', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-glass">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-xl font-bold neon-text"
          >
            <Star className="w-6 h-6" />
            StoreRate
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-bg-glass-hover text-neon-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Role badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'admin' ? 'bg-gradient-primary text-white' :
              user.role === 'storeOwner' ? 'bg-gradient-secondary text-white' :
              'bg-gradient-accent text-white'
            }`}>
              <div className="flex items-center gap-1">
                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                {user.role === 'storeOwner' && <Store className="w-3 h-3" />}
                {user.role === 'user' && <User className="w-3 h-3" />}
                {user.role === 'admin' ? 'Admin' : 
                 user.role === 'storeOwner' ? 'Store Owner' : 'User'}
              </div>
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-glass transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-text-secondary truncate max-w-24">
                  {user.name}
                </span>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass border border-border-glass rounded-lg shadow-lg py-1"
                >
                  <div className="px-3 py-2 border-b border-border-glass">
                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  
                  <button className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-glass-hover hover:text-text-primary flex items-center gap-2 transition-all duration-200">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm text-neon-pink hover:bg-bg-glass-hover flex items-center gap-2 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-bg-glass transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass border-t border-border-glass"
        >
          <div className="container py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-bg-glass-hover text-neon-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-glass'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobile user info */}
            <div className="pt-4 border-t border-border-glass">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
              </div>
              
              <div className="mt-2 space-y-1">
                <button className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-glass-hover hover:text-text-primary flex items-center gap-3 transition-all duration-200 rounded-lg">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-neon-pink hover:bg-bg-glass-hover flex items-center gap-3 transition-all duration-200 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Click outside to close menus */}
      {(isOpen || showUserMenu) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setIsOpen(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
