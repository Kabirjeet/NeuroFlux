import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard,
  LogOut,
  Settings,
  Camera,
  Save,
  Loader2,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../../../services/authService'
import Button from '../../../components/common/Button'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  // Profile form state
  const [name, setName] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authService.updateProfile({ name, email })
      toast.success('Profile updated successfully!')
      // Update the user in context
      if (response.data) {
        // Update local state with returned data
        setName(response.data.username || name)
        setEmail(response.data.email || email)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-dark-100 tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-dark-400 text-sm">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 shrink-0">
            <div className="glass-card p-4">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-dark-700">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-700 border-2 border-dark-800 flex items-center justify-center">
                    <Camera className="w-3 h-3 text-dark-300" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-dark-100 truncate">{user?.username || 'User'}</h3>
                  <p className="text-sm text-dark-400 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-dark-400 hover:bg-dark-700 hover:text-dark-200'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-dark-100 mb-6">Profile Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-dark-600 bg-dark-800 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          placeholder="Your name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-dark-600 bg-dark-800 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-dark-100 mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-emerald-400" />
                    Change Password
                  </h2>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-dark-600 bg-dark-800 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-200">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-dark-600 bg-dark-800 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-200">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-dark-600 bg-dark-800 text-dark-100 placeholder-dark-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-dark-100 mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-dark-300" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">Push Notifications</p>
                        <p className="text-sm text-dark-400">Receive notifications about your learning progress</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications ? 'bg-emerald-500' : 'bg-dark-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-dark-300" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">Email Updates</p>
                        <p className="text-sm text-dark-400">Receive weekly progress reports via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailUpdates(!emailUpdates)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        emailUpdates ? 'bg-emerald-500' : 'bg-dark-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        emailUpdates ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                        {darkMode ? <Moon className="w-5 h-5 text-dark-300" /> : <Sun className="w-5 h-5 text-dark-300" />}
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">Dark Mode</p>
                        <p className="text-sm text-dark-400">Use dark theme for the interface</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        darkMode ? 'bg-emerald-500' : 'bg-dark-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

