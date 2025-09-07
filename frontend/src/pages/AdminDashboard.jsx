import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Store, 
  Star, 
  TrendingUp, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2,
  Shield,
  UserCheck,
  Building
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DataTable from '../components/DataTable';
import UserFormModal from '../components/UserFormModal';
import StoreFormModal from '../components/StoreFormModal';
import RatingStars from '../components/RatingStars';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [usersPagination, setUsersPagination] = useState(null);
  const [storesPagination, setStoresPagination] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1, filters = {}) => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await axios.get(`/api/users?${params}`);
      setUsers(response.data.users);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch stores
  const fetchStores = async (page = 1, filters = {}) => {
    try {
      setStoresLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });
      
      const response = await axios.get(`/api/stores?${params}`);
      setStores(response.data.stores);
      setStoresPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setStoresLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchStores()
      ]);
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  // User actions
  const openUserModal = (user = null) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleUserSaved = () => {
    fetchUsers();
    fetchStats();
  };

  // Store actions
  const openStoreModal = (store = null) => {
    setSelectedStore(store);
    setShowStoreModal(true);
  };

  const closeStoreModal = () => {
    setShowStoreModal(false);
    setSelectedStore(null);
  };

  const handleStoreSaved = () => {
    fetchStores();
    fetchStats();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/${user._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  // User search and filter
  const handleUserSearch = (searchTerm) => {
    fetchUsers(1, { email: searchTerm });
  };

  const handleUserFilter = (filters) => {
    fetchUsers(1, filters);
  };

  // Store search and filter
  const handleStoreSearch = (searchTerm) => {
    fetchStores(1, { name: searchTerm });
  };

  const handleStoreFilter = (filters) => {
    fetchStores(1, filters);
  };

  // Table columns configuration
  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (value) => (
        <div className="font-medium text-text-primary">{value}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      className: 'text-text-secondary'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => {
        const roleInfo = {
          admin: { color: 'text-neon-purple', bg: 'bg-gradient-primary', icon: Shield, label: 'Admin' },
          storeOwner: { color: 'text-neon-blue', bg: 'bg-gradient-secondary', icon: Building, label: 'Store Owner' },
          user: { color: 'text-neon-green', bg: 'bg-gradient-accent', icon: UserCheck, label: 'User' }
        }[value] || { color: 'text-text-muted', bg: 'bg-bg-glass', icon: UserCheck, label: 'Unknown' };
        
        const Icon = roleInfo.icon;
        
        return (
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${roleInfo.bg}`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <span className={`text-sm font-medium ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value) => (
        <span className="text-text-secondary text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  const storeColumns = [
    {
      key: 'name',
      label: 'Store Name',
      render: (value) => (
        <div className="font-medium text-text-primary">{value}</div>
      )
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (value, row) => (
        <div className="text-text-secondary">
          {row.ownerId?.name || 'Unknown'}
        </div>
      )
    },
    {
      key: 'averageRating',
      label: 'Rating',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <RatingStars rating={value} size="sm" showValue={false} />
          <span className="text-sm text-text-secondary">
            {value > 0 ? `${value}/5 (${row.totalRatings})` : 'No ratings'}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Added',
      render: (value) => (
        <span className="text-text-secondary text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table actions
  const userActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (user) => {
        // TODO: Implement user details view
        toast.info('User details view coming soon!');
      }
    },
    {
      label: 'Edit User',
      icon: Edit3,
      onClick: (user) => openUserModal(user)
    },
    {
      label: 'Delete User',
      icon: Trash2,
      className: 'text-neon-pink hover:bg-neon-pink/10',
      onClick: deleteUser
    }
  ];

  const storeActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (store) => {
        // TODO: Implement store details view
        toast.info('Store details view coming soon!');
      }
    },
    {
      label: 'Edit Store',
      icon: Edit3,
      onClick: (store) => openStoreModal(store)
    }
  ];

  const filters = [
    {
      key: 'role',
      placeholder: 'Filter by role',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'storeOwner', label: 'Store Owner' },
        { value: 'user', label: 'User' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome, {user?.name?.split(' ')[0]}! 👨‍💼
            </h1>
            <p className="text-text-secondary">
              System administration dashboard - manage users, stores, and monitor platform activity
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-bg-glass rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'stores', label: 'Stores', icon: Store }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{stats.totalUsers}</h3>
                <p className="text-text-secondary">Total Users</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-secondary mb-4">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{stats.totalStores}</h3>
                <p className="text-text-secondary">Total Stores</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-accent mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{stats.totalRatings}</h3>
                <p className="text-text-secondary">Total Ratings</p>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => openUserModal()}
                  className="btn btn-primary justify-start"
                >
                  <Plus className="w-4 h-4" />
                  Create New User
                </button>
                <button
                  onClick={() => openStoreModal()}
                  className="btn btn-secondary justify-start"
                >
                  <Store className="w-4 h-4" />
                  Add New Store
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
              <button
                onClick={() => openUserModal()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            <DataTable
              data={users}
              columns={userColumns}
              loading={usersLoading}
              pagination={usersPagination}
              onPageChange={(page) => fetchUsers(page)}
              onSearch={handleUserSearch}
              onFilter={handleUserFilter}
              searchPlaceholder="Search by email..."
              filters={filters}
              actions={userActions}
              emptyMessage="No users found"
            />
          </motion.div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Store Management</h2>
              <button
                onClick={() => openStoreModal()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Store
              </button>
            </div>

            <DataTable
              data={stores}
              columns={storeColumns}
              loading={storesLoading}
              pagination={storesPagination}
              onPageChange={(page) => fetchStores(page)}
              onSearch={handleStoreSearch}
              searchPlaceholder="Search by store name..."
              actions={storeActions}
              emptyMessage="No stores found"
            />
          </motion.div>
        )}

        {/* User Form Modal */}
        <UserFormModal
          isOpen={showUserModal}
          onClose={closeUserModal}
          user={selectedUser}
          onUserSaved={handleUserSaved}
        />

        {/* Store Form Modal */}
        <StoreFormModal
          isOpen={showStoreModal}
          onClose={closeStoreModal}
          store={selectedStore}
          onStoreSaved={handleStoreSaved}
        />
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
