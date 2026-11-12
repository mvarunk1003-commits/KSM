import React, { useState, useEffect, useCallback } from "react";
import MediaModal from '../components/MediaModal';
import ReceiptModal from '../components/ReceiptModal';
import ThemeToggle from '../components/ThemeToggle';
import API_BASE from '../config/api';

export default function Admin() {
  // Navigation & UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    masters: true,
    transactions: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeMedia, setActiveMedia] = useState(null);

  // Table Search & Pagination states
  const [tableSearch, setTableSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Data states
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [donations, setDonations] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({});

  // Form states
  const [activityForm, setActivityForm] = useState({ title: '', fromDate: '', toDate: '', description: '', images: [] });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', fromDate: '', toDate: '', description: '', images: [] });
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', images: [] });
  const [incomeForm, setIncomeForm] = useState({ title: '', amount: '', category: 'Donation', date: '', description: '', receipt: null });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'Maintenance', date: '', description: '', receipt: null });
  const [donationForm, setDonationForm] = useState({ donorName: '', email: '', phone: '', address: '', amount: '', purpose: 'General Donation', paymentMethod: 'Online Transfer', status: 'received', date: '' });
  const [settingsForm, setSettingsForm] = useState({ siteTitle: '', siteSubtitle: '', theme: 'traditional', customCSS: '', heroBackground: null, omLogo: null });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  // Admin User CRUD state
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState(null);
  const [adminUserForm, setAdminUserForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    status: 'active'
  });

  // Letterhead Receipt state
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Excel Bulk Upload state
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelUploadType, setExcelUploadType] = useState('donation');
  const [excelFile, setExcelFile] = useState(null);
  const [excelUploading, setExcelUploading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Bulk selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({ category: '', description: '' });
  const [currentBulkType, setCurrentBulkType] = useState('expenses');

  // Report date range state
  const [reportDates, setReportDates] = useState({
    startDate: '',
    endDate: '',
    reportType: 'financial'
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Load all data on component mount
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [activitiesRes, announcementsRes, bannerRes, contactRes, donationsRes, incomeRes, expensesRes, settingsRes, profileRes, adminsRes] = await Promise.all([
        fetch(`${API_BASE}/activities`),
        fetch(`${API_BASE}/announcements`),
        fetch(`${API_BASE}/banner-images`),
        fetch(`${API_BASE}/contact`),
        fetch(`${API_BASE}/donations`),
        fetch(`${API_BASE}/income`),
        fetch(`${API_BASE}/expenses`),
        fetch(`${API_BASE}/settings`),
        fetch(`${API_BASE}/admin/profile`),
        fetch(`${API_BASE}/admins`)
      ]);

      const [activitiesData, announcementsData, bannerData, contactData, donationsData, incomeData, expensesData, settingsData, profileData, adminsData] = await Promise.all([
        activitiesRes.json(),
        announcementsRes.json(),
        bannerRes.json(),
        contactRes.json(),
        donationsRes.json(),
        incomeRes.json(),
        expensesRes.json(),
        settingsRes.json(),
        profileRes.json(),
        adminsRes.json()
      ]);

      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      setBannerImages(Array.isArray(bannerData) ? bannerData : []);
      setContactMessages(Array.isArray(contactData) ? contactData : []);
      setDonations(Array.isArray(donationsData) ? donationsData : []);
      setIncome(Array.isArray(incomeData) ? incomeData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setSettings(settingsData || {});
      setSettingsForm(settingsData || {});
      setProfileForm({ name: profileData?.name || 'Admin', email: profileData?.email || 'admin@kolarshankaramutt.org' });
      setAdminUsers(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Failed to load initial data from server.');
      setActivities([]);
      setAnnouncements([]);
      setBannerImages([]);
      setContactMessages([]);
      setDonations([]);
      setIncome([]);
      setExpenses([]);
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Reset pagination and search when tab changes
  useEffect(() => {
    setTableSearch('');
    setTableFilter('all');
    setCurrentPage(1);
    setSelectedItems([]);
    setSelectAll(false);
  }, [activeTab]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the admin dashboard?')) {
      localStorage.removeItem('authData');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('rememberMe');
      window.location.href = '/login';
    }
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile drawer
  };

  // Bulk selection functions
  const getDataByType = useCallback((dataType) => {
    switch (dataType) {
      case 'activities': return activities;
      case 'announcements': return announcements;
      case 'banners':
      case 'banner-images': return bannerImages;
      case 'income': return income;
      case 'expenses': return expenses;
      case 'donations': return donations;
      case 'contact':
      case 'messages': return contactMessages;
      default: return [];
    }
  }, [activities, announcements, bannerImages, income, expenses, donations, contactMessages]);

  const handleSelectAll = (dataType) => {
    const data = getDataByType(dataType);
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(data.map(item => item.id));
      setSelectAll(true);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleBulkDelete = async (dataType) => {
    if (selectedItems.length === 0) {
      showMessage('error', 'Please select items to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedItems.length} selected items?`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = selectedItems.map(id => 
        fetch(`${API_BASE}/${dataType}/${id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(res => res.ok).length;
      
      if (successCount === selectedItems.length) {
        showMessage('success', `Successfully deleted ${successCount} items`);
        setSelectedItems([]);
        setSelectAll(false);
        loadAllData();
      } else {
        showMessage('error', `Failed to delete some items. ${successCount}/${selectedItems.length} deleted`);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete selected items');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEdit = (dataType) => {
    if (selectedItems.length === 0) {
      showMessage('error', 'Please select items to edit');
      return;
    }

    const typeMap = {
      'activities': 'activity',
      'announcements': 'announcement',
      'income': 'income',
      'expenses': 'expense',
      'donations': 'donation',
      'banner-images': 'banner'
    };

    if (selectedItems.length === 1) {
      const data = getDataByType(dataType);
      const item = data.find(item => item.id === selectedItems[0]);
      if (item) {
        const singularType = typeMap[dataType] || dataType.replace(/s$/, '');
        openModal(singularType, item);
      }
    } else {
      setCurrentBulkType(dataType);
      setBulkEditForm({ category: '', description: '' });
      setShowModal(true);
      setModalType('bulk-edit');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.length === 0) {
      showMessage('error', 'No items selected for update');
      return;
    }

    setLoading(true);
    try {
      const updatePromises = selectedItems.map(id => {
        const updateData = {};
        if (bulkEditForm.category) updateData.category = bulkEditForm.category;
        if (bulkEditForm.description) updateData.description = bulkEditForm.description;

        return fetch(`${API_BASE}/${currentBulkType}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      });

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(res => res.ok).length;

      if (successCount === selectedItems.length) {
        showMessage('success', `Successfully updated ${successCount} items`);
        setSelectedItems([]);
        setSelectAll(false);
        setBulkEditForm({ category: '', description: '' });
        setShowModal(false);
        loadAllData();
      } else {
        showMessage('error', `Failed to update some items. ${successCount}/${selectedItems.length} updated`);
      }
    } catch (error) {
      showMessage('error', 'Failed to update selected items');
    } finally {
      setLoading(false);
    }
  };

  // Generic CRUD operations
  const handleSubmit = async (endpoint, formData, formType) => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'images' && formData[key].length > 0) {
            formData[key].forEach(file => data.append('images', file));
          } else if (key === 'heroBackground' || key === 'omLogo') {
            if (formData[key]) data.append(key, formData[key]);
          } else if (key !== 'images') {
            data.append(key, formData[key]);
          }
        }
      });

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${API_BASE}/${endpoint}/${editingItem.id}` : `${API_BASE}/${endpoint}`;
      
      const response = await fetch(url, { method, body: data });
      const result = await response.json();

      if (response.ok) {
        showMessage('success', `${formType} ${editingItem ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        setEditingItem(null);
        loadAllData();
      } else {
        showMessage('error', result.error || `Failed to ${editingItem ? 'update' : 'add'} ${formType}`);
      }
    } catch (error) {
      showMessage('error', `Failed to ${editingItem ? 'update' : 'add'} ${formType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (endpoint, id, itemType) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('success', `${itemType} deleted successfully!`);
        loadAllData();
      } else {
        showMessage('error', `Failed to delete ${itemType}`);
      }
    } catch (error) {
      showMessage('error', `Failed to delete ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  // Status Approval Workflow
  const handleUpdateStatus = async (endpoint, item, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${endpoint}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      if (response.ok) {
        showMessage('success', `Status updated to ${newStatus}`);
        loadAllData();
      } else {
        showMessage('error', 'Failed to update status');
      }
    } catch (err) {
      showMessage('error', 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
    
    if (type === 'activity') {
      setActivityForm(item ? { ...item, images: [] } : { title: '', fromDate: '', toDate: '', description: '', images: [] });
    } else if (type === 'announcement') {
      setAnnouncementForm(item ? { ...item, images: [] } : { title: '', fromDate: '', toDate: '', description: '', images: [] });
    } else if (type === 'banner') {
      setBannerForm(item ? { ...item, images: [] } : { title: '', description: '', images: [] });
    } else if (type === 'income') {
      setIncomeForm(item ? { ...item, receipt: null } : { title: '', amount: '', category: 'Donation', date: new Date().toISOString().split('T')[0], description: '', receipt: null });
    } else if (type === 'expense') {
      setExpenseForm(item ? { ...item, receipt: null } : { title: '', amount: '', category: 'Maintenance', date: new Date().toISOString().split('T')[0], description: '', receipt: null });
    } else if (type === 'donation') {
      setDonationForm(item ? {
        donorName: item.donorName || '',
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        amount: item.amount || '',
        purpose: item.purpose || 'General Donation',
        paymentMethod: item.paymentMethod || 'Online Transfer',
        status: item.status || 'received',
        date: item.date ? (item.date.includes('T') ? item.date.split('T')[0] : item.date) : new Date().toISOString().split('T')[0]
      } : {
        donorName: '',
        email: '',
        phone: '',
        address: '',
        amount: '',
        purpose: 'General Donation',
        paymentMethod: 'Online Transfer',
        status: 'received',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      
      const result = await response.json();
      if (response.ok) {
        showMessage('success', 'Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage('error', result.error || 'Failed to change password');
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      
      const result = await response.json();
      if (response.ok) {
        showMessage('success', 'Profile updated successfully!');
        loadAllData();
      } else {
        showMessage('error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(settingsForm).forEach(key => {
        if (settingsForm[key] !== null && settingsForm[key] !== undefined) {
          if (key === 'heroBackground' || key === 'omLogo') {
            if (settingsForm[key]) data.append(key, settingsForm[key]);
          } else {
            data.append(key, settingsForm[key]);
          }
        }
      });

      const response = await fetch(`${API_BASE}/settings/background`, { method: 'PUT', body: data });
      const result = await response.json();
      
      if (response.ok) {
        showMessage('success', 'Site settings saved successfully!');
        setSettings(result);
      } else {
        showMessage('error', result.error || 'Failed to update settings');
      }
    } catch (error) {
      showMessage('error', 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Financial calculations
  const calculateTotalDonations = useCallback(() => {
    if (!Array.isArray(donations)) return 0;
    return donations.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  }, [donations]);

  const calculateTotalIncome = useCallback(() => {
    if (!Array.isArray(income)) return 0;
    const incomeTotal = income.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
    const donationTotal = calculateTotalDonations();
    return incomeTotal + donationTotal;
  }, [income, calculateTotalDonations]);

  const calculateTotalExpenses = useCallback(() => {
    if (!Array.isArray(expenses)) return 0;
    return expenses.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  }, [expenses]);

  const generateMonthlyAudit = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyIncome = income.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    const monthlyExpenses = expenses.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    const monthlyDonations = donations.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });

    const totalMonthlyIncome = monthlyIncome.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
    const totalMonthlyExpenses = monthlyExpenses.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
    const totalMonthlyDonations = monthlyDonations.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
    const totalIncomeWithDonations = totalMonthlyIncome + totalMonthlyDonations;
    const netIncome = totalIncomeWithDonations - totalMonthlyExpenses;

    const auditContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Monthly Audit Report - ${currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #2C1810; }
            .header { text-align: center; border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 30px; }
            .temple-name { font-size: 24px; font-weight: bold; color: #8B4513; margin-bottom: 8px; }
            .audit-title { font-size: 18px; font-weight: bold; color: #5D4037; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .summary-table td { padding: 10px; border-bottom: 1px solid #E5D6C3; }
            .income { color: #2E7D32; font-weight: bold; }
            .expense { color: #C62828; font-weight: bold; }
            .net { color: #1565C0; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ccc; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="temple-name">Kolar Sringeri SriShankara Mutt</div>
            <div class="audit-title">Official Monthly Financial Audit</div>
            <div>Period: ${currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
          </div>
          
          <table class="summary-table">
            <tr><td>Total Direct Income:</td><td class="income">₹${totalMonthlyIncome.toFixed(2)}</td></tr>
            <tr><td>Total Devotee Donations:</td><td class="income">₹${totalMonthlyDonations.toFixed(2)}</td></tr>
            <tr><td>Gross Revenue (Income + Donations):</td><td class="income">₹${totalIncomeWithDonations.toFixed(2)}</td></tr>
            <tr><td>Total Disbursed Expenses:</td><td class="expense">₹${totalMonthlyExpenses.toFixed(2)}</td></tr>
            <tr><td><strong>Net Operating Balance:</strong></td><td class="net">₹${netIncome.toFixed(2)}</td></tr>
          </table>

          <div class="footer">
            <p>Generated by Kolar Shankara Mutt ERP System on ${currentDate.toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([auditContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showMessage('success', 'Monthly audit downloaded successfully!');
  };

  const handleGenerateReceipt = (donation) => {
    setSelectedReceiptDonation(donation);
    setShowReceiptModal(true);
  };

  const loadAdminUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admins`);
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleOpenAdminModal = (admin = null) => {
    if (admin) {
      setEditingAdminUser(admin);
      setAdminUserForm({
        username: admin.username || '',
        password: '',
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        role: admin.role || 'Admin',
        status: admin.status || 'active'
      });
    } else {
      setEditingAdminUser(null);
      setAdminUserForm({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        role: 'Admin',
        status: 'active'
      });
    }
    setShowAdminUserModal(true);
  };

  const handleSaveAdminUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAdminUser) {
        const payload = {
          name: adminUserForm.name,
          email: adminUserForm.email,
          phone: adminUserForm.phone,
          role: adminUserForm.role,
          status: adminUserForm.status
        };
        if (adminUserForm.password && adminUserForm.password.trim().length >= 6) {
          payload.newPassword = adminUserForm.password.trim();
        }
        const res = await fetch(`${API_BASE}/admins/${editingAdminUser.id || editingAdminUser.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showMessage('success', 'Admin user updated successfully');
          setShowAdminUserModal(false);
          loadAdminUsers();
        } else {
          const errData = await res.json();
          showMessage('error', errData.error || 'Failed to update admin user');
        }
      } else {
        if (!adminUserForm.username || !adminUserForm.password || !adminUserForm.name) {
          showMessage('error', 'Username, password, and full name are required');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/admins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminUserForm)
        });
        if (res.ok) {
          showMessage('success', 'New administrator created successfully');
          setShowAdminUserModal(false);
          loadAdminUsers();
        } else {
          const errData = await res.json();
          showMessage('error', errData.error || 'Failed to create admin user');
        }
      }
    } catch (err) {
      console.error('Error saving admin:', err);
      showMessage('error', 'Network error occurred while saving administrator');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminUser = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete administrator "${username}"? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showMessage('success', `Administrator "${username}" removed successfully`);
        loadAdminUsers();
      } else {
        const errData = await res.json();
        showMessage('error', errData.error || 'Failed to delete administrator');
      }
    } catch (err) {
      console.error('Error deleting admin:', err);
      showMessage('error', 'Network error occurred while deleting administrator');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType, startDate = '', endDate = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, startDate, endDate })
      });

      const result = await response.json();
      if (response.ok && result.reportContent) {
        const blob = new Blob([result.reportContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showMessage('success', `${reportType.toUpperCase()} report generated and downloaded!`);
      } else {
        showMessage('error', result.error || 'Failed to generate report');
      }
    } catch (error) {
      showMessage('error', 'Failed to generate report from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExcelModal = (type = 'donation') => {
    setExcelUploadType(type);
    setExcelFile(null);
    setShowExcelModal(true);
  };

  const handleDownloadTemplate = (type) => {
    const link = document.createElement('a');
    link.href = `${API_BASE}/download-template/${type}`;
    link.download = `${type}-template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('info', `Downloading ${type} Excel template...`);
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      showMessage('error', 'Please select an Excel file (.xlsx or .xls) to upload');
      return;
    }

    setExcelUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('type', excelUploadType);

      const res = await fetch(`${API_BASE}/upload-excel`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        showMessage('success', data.message || `Successfully imported ${data.count} ${excelUploadType} records!`);
        setShowExcelModal(false);
        setExcelFile(null);
        loadAllData();
      } else {
        showMessage('error', data.error || 'Failed to upload Excel file');
      }
    } catch (err) {
      console.error('Error uploading excel:', err);
      showMessage('error', 'Network error while uploading Excel file');
    } finally {
      setExcelUploading(false);
    }
  };

  // Render Modern Data Table with Search, Filter & Pagination
  const renderDataTable = (data, type, columns) => {
    const dataType = type === 'activity' ? 'activities' : 
                    type === 'announcement' ? 'announcements' : 
                    type === 'income' ? 'income' : 
                    type === 'expense' ? 'expenses' : 
                    type === 'donation' ? 'donations' : 
                    type === 'message' ? 'contact' : 'banner-images';

    // Filter data based on search term and category/status
    const filteredData = data.filter(item => {
      if (tableFilter !== 'all') {
        const itemStatus = (item.status || item.category || '').toLowerCase();
        if (itemStatus !== tableFilter.toLowerCase()) return false;
      }
      if (!tableSearch.trim()) return true;
      const search = tableSearch.toLowerCase();
      return columns.some(col => {
        const val = item[col.key];
        return val && String(val).toLowerCase().includes(search);
      });
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="table-wrapper">
        {/* Table Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', maxWidth: '480px' }}>
            <label htmlFor={`search-${type}`} className="sr-only">Search table</label>
            <input 
              id={`search-${type}`}
              type="text" 
              placeholder={`Search ${type}s...`}
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
              className="form-input"
              style={{ fontSize: '0.875rem' }}
            />
            {(type === 'donation' || type === 'income' || type === 'expense') && (
              <select
                value={tableFilter}
                onChange={(e) => { setTableFilter(e.target.value); setCurrentPage(1); }}
                className="form-select"
                style={{ width: 'auto', fontSize: '0.85rem' }}
                aria-label="Filter records"
              >
                <option value="all">All Statuses / Categories</option>
                {type === 'donation' ? (
                  <>
                    <option value="received">Approved / Received</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                ) : type === 'income' ? (
                  <>
                    <option value="Donation">Donation</option>
                    <option value="Hundi">Hundi</option>
                    <option value="Special Pooja">Special Pooja</option>
                  </>
                ) : (
                  <>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Annadanam">Annadanam</option>
                    <option value="Electricity/Water">Utility</option>
                  </>
                )}
              </select>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredData.length > 0 ? startIndex + 1 : 0}&ndash;{Math.min(startIndex + itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="bulk-actions-bar" role="region" aria-label="Bulk actions">
            <span className="selected-count">
              {selectedItems.length} record{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="bulk-actions">
              <button 
                type="button"
                className="btn btn-sm btn-edit" 
                onClick={() => handleBulkEdit(dataType)}
                disabled={loading}
              >
                Edit Selected
              </button>
              <button 
                type="button"
                className="btn btn-sm btn-delete" 
                onClick={() => handleBulkDelete(dataType)}
                disabled={loading}
              >
                Delete Selected
              </button>
              <button 
                type="button"
                className="btn btn-sm btn-secondary" 
                onClick={() => {
                  setSelectedItems([]);
                  setSelectAll(false);
                }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Responsive Table Container */}
        <div className="data-table">
          <table aria-label={`${type} data table`}>
            <thead>
              <tr>
                <th className="checkbox-column" scope="col">
                  <input 
                    type="checkbox" 
                    checked={selectAll && filteredData.length > 0}
                    onChange={() => handleSelectAll(dataType)}
                    disabled={loading || filteredData.length === 0}
                    aria-label="Select all rows"
                  />
                </th>
                {columns.map(col => (
                  <th key={col.key} scope="col">{col.label}</th>
                ))}
                <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map(item => (
                  <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected-row' : ''}>
                    <td className="checkbox-column">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        disabled={loading}
                        aria-label={`Select item ${item.title || item.donorName || item.name || item.id}`}
                      />
                    </td>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {type !== 'message' && (
                        <button 
                          type="button"
                          className="btn btn-sm btn-edit" 
                          onClick={() => openModal(type, item)}
                          style={{ marginRight: '6px' }}
                          title="Edit record"
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        type="button"
                        className="btn btn-sm btn-delete" 
                        onClick={() => handleDelete(dataType, item.id, type)}
                        title="Delete record"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                type="button"
                className="btn btn-sm btn-secondary" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCurrentPage(page)}
                  style={{ minWidth: '32px' }}
                >
                  {page}
                </button>
              ))}
              <button 
                type="button"
                className="btn btn-sm btn-secondary" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dashboard Overview Render
  const renderDashboard = () => (
    <div>
      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Activities</h3>
          <p className="stat-number">{activities.length}</p>
          <p className="stat-label">Temple ceremonies &amp; discourses</p>
        </div>
        <div className="stat-card">
          <h3>Announcements</h3>
          <p className="stat-number">{announcements.length}</p>
          <p className="stat-label">Active notices &amp; circulars</p>
        </div>
        <div className="stat-card">
          <h3>Devotee Donations</h3>
          <p className="stat-number">{donations.length}</p>
          <p className="stat-label">Seva contributions recorded</p>
        </div>
        <div className="stat-card">
          <h3>Inquiries</h3>
          <p className="stat-number">{contactMessages.length}</p>
          <p className="stat-label">Devotee messages received</p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Financial Snapshot</h2>
      <div className="stats-grid">
        <div className="stat-card financial income">
          <h3>Total Income</h3>
          <p className="stat-number income">₹{calculateTotalIncome().toFixed(2)}</p>
          <p className="stat-label">Direct: ₹{(calculateTotalIncome() - calculateTotalDonations()).toFixed(2)} | Donations: ₹{calculateTotalDonations().toFixed(2)}</p>
        </div>
        <div className="stat-card financial expense">
          <h3>Total Expenses</h3>
          <p className="stat-number expense">₹{calculateTotalExpenses().toFixed(2)}</p>
          <p className="stat-label">All recorded mutt expenditures</p>
        </div>
        <div className="stat-card financial net">
          <h3>Net Operating Balance</h3>
          <p className="stat-number net">₹{(calculateTotalIncome() - calculateTotalExpenses()).toFixed(2)}</p>
          <p className="stat-label">Current surplus funds</p>
        </div>
        <div className="stat-card financial donation">
          <h3>Donation Funds</h3>
          <p className="stat-number donation">₹{calculateTotalDonations().toFixed(2)}</p>
          <p className="stat-label">Dedicated seva receipts</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ margin: 'var(--spacing-xl) 0', padding: 'var(--spacing-md)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--primary)' }}>Quick Operational Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => openModal('activity')}>New Activity</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('announcement')}>New Announcement</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('income')}>Record Income</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('expense')}>Record Expense</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('donation')}>Record Donation</button>
          <button type="button" className="btn btn-secondary" onClick={generateMonthlyAudit}>Run Monthly Audit</button>
        </div>
      </div>

      {/* Recent Activities & Announcements */}
      <div className="dashboard-recent">
        <div className="recent-section">
          <h3>Recent Activities</h3>
          {activities.slice(0, 5).map(activity => (
            <div key={activity.id} className="recent-item">
              <div>
                <h4>{activity.title}</h4>
                <p>{activity.fromDate || activity.date || 'Scheduled'}</p>
              </div>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => openModal('activity', activity)}>
                View
              </button>
            </div>
          ))}
          {activities.length === 0 && <p className="no-data">No activities logged yet.</p>}
        </div>

        <div className="recent-section">
          <h3>Recent Announcements</h3>
          {announcements.slice(0, 5).map(announcement => (
            <div key={announcement.id} className="recent-item">
              <div>
                <h4>{announcement.title}</h4>
                <p>{announcement.fromDate || announcement.date || 'Notice'}</p>
              </div>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => openModal('announcement', announcement)}>
                View
              </button>
            </div>
          ))}
          {announcements.length === 0 && <p className="no-data">No announcements published.</p>}
        </div>
      </div>
    </div>
  );

  // Financial Management Component (Transactions)
  const renderAccounts = () => (
    <div className="accounts-section">
      <div className="accounts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2>Financial Transactions &amp; Ledgers</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage receipts, disbursements, seva donations, and audits</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => openModal('income')}>Add Income</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('expense')}>Add Expense</button>
          <button type="button" className="btn btn-primary" onClick={() => openModal('donation')}>Add Donation</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleOpenExcelModal('donation')} title="Import bulk transactions from Excel">
            📊 Upload Excel
          </button>
          <button type="button" className="btn btn-secondary" onClick={generateMonthlyAudit}>Monthly Audit</button>
        </div>
      </div>

      <div className="accounts-summary">
        <div className="summary-card income">
          <h3>Total Revenue</h3>
          <p className="amount">₹{calculateTotalIncome().toFixed(2)}</p>
          <p className="sub-amount">Direct: ₹{(calculateTotalIncome() - calculateTotalDonations()).toFixed(2)}</p>
          <p className="sub-amount">Donations: ₹{calculateTotalDonations().toFixed(2)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Total Disbursed</h3>
          <p className="amount">₹{calculateTotalExpenses().toFixed(2)}</p>
        </div>
        <div className="summary-card net">
          <h3>Current Balance</h3>
          <p className="amount">₹{(calculateTotalIncome() - calculateTotalExpenses()).toFixed(2)}</p>
        </div>
        <div className="summary-card donation">
          <h3>Donations Total</h3>
          <p className="amount">₹{calculateTotalDonations().toFixed(2)}</p>
        </div>
      </div>

      {/* Income Ledger Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="card-title">Income Records</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleOpenExcelModal('income')}>Upload Excel</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => openModal('income')}>+ Add Income</button>
          </div>
        </div>
        {renderDataTable(income, 'income', [
          { key: 'title', label: 'Title' },
          { key: 'amount', label: 'Amount', render: (val) => <strong style={{ color: '#2E7D32' }}>₹{parseFloat(val || 0).toLocaleString('en-IN')}</strong> },
          { key: 'category', label: 'Category', render: (val) => <span className="badge badge-info">{val}</span> },
          { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' },
          { key: 'receipt', label: 'Receipt', render: (val, item) => val ? <button type="button" className="btn btn-sm btn-secondary" onClick={() => setActiveMedia({ media: val, title: `${item.title} Receipt` })}>View Receipt</button> : '-' },
          { key: 'description', label: 'Description', render: (val) => val ? (val.length > 35 ? val.substring(0, 35) + '...' : val) : '-' }
        ])}
      </div>

      {/* Expenses Ledger Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="card-title">Expense Records</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleOpenExcelModal('expense')}>Upload Excel</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => openModal('expense')}>+ Add Expense</button>
          </div>
        </div>
        {renderDataTable(expenses, 'expense', [
          { key: 'title', label: 'Title' },
          { key: 'amount', label: 'Amount', render: (val) => <strong style={{ color: '#C62828' }}>₹{parseFloat(val || 0).toLocaleString('en-IN')}</strong> },
          { key: 'category', label: 'Category', render: (val) => <span className="badge badge-warning">{val}</span> },
          { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' },
          { key: 'receipt', label: 'Receipt', render: (val, item) => val ? <button type="button" className="btn btn-sm btn-secondary" onClick={() => setActiveMedia({ media: val, title: `${item.title} Receipt` })}>View Receipt</button> : '-' },
          { key: 'description', label: 'Description', render: (val) => val ? (val.length > 35 ? val.substring(0, 35) + '...' : val) : '-' }
        ])}
      </div>

      {/* Donations Ledger Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="card-title">Seva Donations</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleOpenExcelModal('donation')}>Upload Excel</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => openModal('donation')}>+ Add Donation</button>
          </div>
        </div>
        {renderDataTable(donations, 'donation', [
          { key: 'donorName', label: 'Donor Name' },
          { key: 'amount', label: 'Amount', render: (val) => <strong>₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> },
          { key: 'purpose', label: 'Purpose' },
          { key: 'paymentMethod', label: 'Payment Mode' },
          { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
              const statusStr = (val || 'received').toLowerCase();
              if (statusStr === 'received' || statusStr === 'approved') {
                return <span className="status-badge approved">Approved</span>;
              } else if (statusStr === 'pending') {
                return <span className="status-badge pending">Pending</span>;
              } else {
                return <span className="status-badge rejected">{statusStr}</span>;
              }
            }
          },
          { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' },
          {
            key: 'receipt',
            label: 'Letterhead Receipt',
            render: (_, item) => (
              <button 
                type="button" 
                className="btn btn-sm btn-primary"
                onClick={() => handleGenerateReceipt(item)}
                title="View and print official letterhead receipt"
              >
                Receipt
              </button>
            )
          }
        ])}
      </div>
    </div>
  );

  // Approvals Workflow View
  const renderApprovals = () => {
    const pendingCount = donations.filter(d => (d.status || '').toLowerCase() === 'pending').length;
    return (
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Verification &amp; Approval Workflows</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Review incoming online devotee donations and financial postings ({pendingCount} Pending Verification)
            </p>
          </div>
        </div>

        {renderDataTable(donations, 'donation', [
          { key: 'donorName', label: 'Donor Name' },
          { key: 'amount', label: 'Amount', render: (val) => <strong>₹{parseFloat(val || 0).toLocaleString('en-IN')}</strong> },
          { key: 'purpose', label: 'Purpose' },
          { key: 'transactionId', label: 'Transaction ID / UTR', render: (val, item) => <code>{val || item.transactionRef || '-'}</code> },
          { 
            key: 'status', 
            label: 'Current Status', 
            render: (val, item) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status-badge ${(val || 'received').toLowerCase()}`}>
                  {(val || 'received').toLowerCase() === 'pending' ? 'Pending Approval' : 'Approved'}
                </span>
                <select
                  value={val || 'received'}
                  onChange={(e) => handleUpdateStatus('donations', item, e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '2px 6px', fontSize: '0.75rem' }}
                >
                  <option value="received">Approved / Received</option>
                  <option value="pending">Pending Verification</option>
                  <option value="cancelled">Rejected / Cancelled</option>
                </select>
              </div>
            ) 
          },
          {
            key: 'action',
            label: 'Approval & Receipt',
            render: (_, item) => {
              const isApproved = (item.status || '').toLowerCase() === 'received' || (item.status || '').toLowerCase() === 'approved';
              return isApproved ? (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleGenerateReceipt(item)}
                >
                  View Receipt
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: '#16A34A',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    await handleUpdateStatus('donations', item, 'received');
                    handleGenerateReceipt({ ...item, status: 'received' });
                  }}
                >
                  ✓ Approve &amp; Generate Receipt
                </button>
              );
            }
          },
          { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' }
        ])}
      </div>
    );
  };

  // Reports Generation View
  const renderReports = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Financial &amp; Operational Reports</h2>
        <p style={{ color: 'var(--text-muted)' }}>Generate and download custom audit statements and transaction ledgers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
        {/* Instant Monthly Audit */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Monthly Audit Statement</h3>
          <p style={{ fontSize: '0.875rem' }}>Generate an instant audit summarizing total revenue, donations, and expenses for the current month.</p>
          <button type="button" className="btn btn-primary" onClick={generateMonthlyAudit} style={{ marginTop: 'var(--spacing-sm)' }}>
            Generate Current Month Audit
          </button>
        </div>

        {/* Date Range Report */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Custom Date Range Report</h3>
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Report Category</label>
            <select 
              value={reportDates.reportType} 
              onChange={(e) => setReportDates({ ...reportDates, reportType: e.target.value })}
              className="form-select"
            >
              <option value="financial">Complete Financial Statement</option>
              <option value="income">Income Only</option>
              <option value="expenses">Expenses Only</option>
              <option value="donations">Donations Only</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date" 
                value={reportDates.startDate} 
                onChange={(e) => setReportDates({ ...reportDates, startDate: e.target.value })}
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date" 
                value={reportDates.endDate} 
                onChange={(e) => setReportDates({ ...reportDates, endDate: e.target.value })}
                className="form-input" 
              />
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => generateReport(reportDates.reportType, reportDates.startDate, reportDates.endDate)}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Export HTML Report'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Modal Dialog & Forms
  const renderModal = () => {
    if (!showModal) return null;

    const getForm = () => {
      switch (modalType) {
        case 'activity':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('activities', activityForm, 'Activity'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Activity Information</legend>
                <div className="form-group">
                  <label htmlFor="act-title" className="form-label">Title <span className="required-indicator">*</span></label>
                  <input id="act-title" type="text" value={activityForm.title} onChange={(e) => setActivityForm({...activityForm, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="act-from" className="form-label">From Date <span className="required-indicator">*</span></label>
                    <input id="act-from" type="date" value={activityForm.fromDate} onChange={(e) => setActivityForm({...activityForm, fromDate: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="act-to" className="form-label">To Date</label>
                    <input id="act-to" type="date" value={activityForm.toDate} onChange={(e) => setActivityForm({...activityForm, toDate: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="act-desc" className="form-label">Description <span className="required-indicator">*</span></label>
                  <textarea id="act-desc" value={activityForm.description} onChange={(e) => setActivityForm({...activityForm, description: e.target.value})} className="form-textarea" rows="4" required />
                </div>
                <div className="form-group">
                  <label htmlFor="act-img" className="form-label">Attach Photos / Documents (Multiple Allowed)</label>
                  <input id="act-img" type="file" multiple onChange={(e) => setActivityForm({...activityForm, images: Array.from(e.target.files)})} className="form-input" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Activity' : 'Create Activity'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'announcement':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('announcements', announcementForm, 'Announcement'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Announcement Details</legend>
                <div className="form-group">
                  <label htmlFor="ann-title" className="form-label">Title <span className="required-indicator">*</span></label>
                  <input id="ann-title" type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ann-from" className="form-label">Effective Date <span className="required-indicator">*</span></label>
                    <input id="ann-from" type="date" value={announcementForm.fromDate} onChange={(e) => setAnnouncementForm({...announcementForm, fromDate: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ann-to" className="form-label">Expiry / Valid Until Date</label>
                    <input id="ann-to" type="date" value={announcementForm.toDate} onChange={(e) => setAnnouncementForm({...announcementForm, toDate: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ann-desc" className="form-label">Description <span className="required-indicator">*</span></label>
                  <textarea id="ann-desc" value={announcementForm.description} onChange={(e) => setAnnouncementForm({...announcementForm, description: e.target.value})} className="form-textarea" rows="4" required />
                </div>
                <div className="form-group">
                  <label htmlFor="ann-img" className="form-label">Attach Circulars / PDF Notices</label>
                  <input id="ann-img" type="file" multiple onChange={(e) => setAnnouncementForm({...announcementForm, images: Array.from(e.target.files)})} className="form-input" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Announcement' : 'Publish Announcement'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'banner':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('banner-images', bannerForm, 'Banner'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Banner Image Details</legend>
                <div className="form-group">
                  <label htmlFor="ban-title" className="form-label">Banner Title <span className="required-indicator">*</span></label>
                  <input id="ban-title" type="text" value={bannerForm.title} onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="ban-desc" className="form-label">Subtitle / Description</label>
                  <textarea id="ban-desc" value={bannerForm.description} onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})} className="form-textarea" rows="3" />
                </div>
                <div className="form-group">
                  <label htmlFor="ban-img" className="form-label">Upload High-Resolution Images</label>
                  <input id="ban-img" type="file" multiple onChange={(e) => setBannerForm({...bannerForm, images: Array.from(e.target.files)})} className="form-input" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Banner' : 'Upload Banner'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'income':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('income', incomeForm, 'Income'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Income Record Details</legend>
                <div className="form-group">
                  <label htmlFor="inc-title" className="form-label">Title / Source <span className="required-indicator">*</span></label>
                  <input id="inc-title" type="text" value={incomeForm.title} onChange={(e) => setIncomeForm({...incomeForm, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inc-amt" className="form-label">Amount (₹) <span className="required-indicator">*</span></label>
                    <input id="inc-amt" type="number" step="0.01" value={incomeForm.amount} onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inc-cat" className="form-label">Category</label>
                    <select id="inc-cat" value={incomeForm.category} onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})} className="form-select">
                      <option value="Donation">General Seva Donation</option>
                      <option value="Hundi">Hundi Collection</option>
                      <option value="Special Pooja">Special Pooja Booking</option>
                      <option value="Rent/Hall">Kalyana Mantapa / Hall</option>
                      <option value="Interest">Bank Interest</option>
                      <option value="Other">Other Income</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="inc-date" className="form-label">Date <span className="required-indicator">*</span></label>
                  <input id="inc-date" type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="inc-desc" className="form-label">Description / Remarks</label>
                  <textarea id="inc-desc" value={incomeForm.description} onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})} className="form-textarea" rows="3" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Income' : 'Save Income'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'expense':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('expenses', expenseForm, 'Expense'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Expense Details</legend>
                <div className="form-group">
                  <label htmlFor="exp-title" className="form-label">Expense Title <span className="required-indicator">*</span></label>
                  <input id="exp-title" type="text" value={expenseForm.title} onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="exp-amt" className="form-label">Amount (₹) <span className="required-indicator">*</span></label>
                    <input id="exp-amt" type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exp-cat" className="form-label">Category</label>
                    <select id="exp-cat" value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} className="form-select">
                      <option value="Maintenance">Temple Maintenance</option>
                      <option value="Annadanam">Annadanam Groceries &amp; Supplies</option>
                      <option value="Electricity/Water">Utility Bills</option>
                      <option value="Pooja Samagri">Pooja Items &amp; Flowers</option>
                      <option value="Salaries">Priests &amp; Staff Honorarium</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="exp-date" className="form-label">Date <span className="required-indicator">*</span></label>
                  <input id="exp-date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="exp-desc" className="form-label">Description / Bill Reference</label>
                  <textarea id="exp-desc" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} className="form-textarea" rows="3" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Expense' : 'Save Expense'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'donation':
          return (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('donations', donationForm, 'Donation'); }}>
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend className="sr-only">Donation Recording Form</legend>
                <div className="form-group">
                  <label htmlFor="don-name" className="form-label">Donor Name <span className="required-indicator">*</span></label>
                  <input id="don-name" type="text" value={donationForm.donorName} onChange={(e) => setDonationForm({...donationForm, donorName: e.target.value})} className="form-input" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="don-amt" className="form-label">Amount (₹) <span className="required-indicator">*</span></label>
                    <input id="don-amt" type="number" step="0.01" value={donationForm.amount} onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="don-mode" className="form-label">Payment Mode</label>
                    <select id="don-mode" value={donationForm.paymentMethod} onChange={(e) => setDonationForm({...donationForm, paymentMethod: e.target.value})} className="form-select">
                      <option value="Online Transfer">Online Transfer</option>
                      <option value="UPI Payment">UPI (GPay/PhonePe)</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="don-purpose" className="form-label">Purpose</label>
                    <input id="don-purpose" type="text" value={donationForm.purpose} onChange={(e) => setDonationForm({...donationForm, purpose: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="don-status" className="form-label">Approval Status</label>
                    <select id="don-status" value={donationForm.status} onChange={(e) => setDonationForm({...donationForm, status: e.target.value})} className="form-select">
                      <option value="received">Approved / Received</option>
                      <option value="pending">Pending Verification</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="don-phone" className="form-label">Phone</label>
                    <input id="don-phone" type="tel" value={donationForm.phone} onChange={(e) => setDonationForm({...donationForm, phone: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="don-email" className="form-label">Email</label>
                    <input id="don-email" type="email" value={donationForm.email} onChange={(e) => setDonationForm({...donationForm, email: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingItem ? 'Update Donation' : 'Record Donation'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </fieldset>
            </form>
          );

        case 'bulk-edit':
          return (
            <div className="bulk-edit-form">
              <p style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>
                Updating <strong>{selectedItems.length}</strong> selected records in <em>{currentBulkType}</em>:
              </p>
              <div className="form-group">
                <label className="form-label">Batch Category Update</label>
                <input 
                  type="text" 
                  value={bulkEditForm.category} 
                  onChange={(e) => setBulkEditForm({...bulkEditForm, category: e.target.value})}
                  className="form-input"
                  placeholder="Leave blank to keep existing categories"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Description Update</label>
                <textarea 
                  value={bulkEditForm.description} 
                  onChange={(e) => setBulkEditForm({...bulkEditForm, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Leave blank to keep existing descriptions"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={handleBulkUpdate} disabled={loading}>{loading ? 'Updating...' : 'Apply Bulk Updates'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div 
        className="modal-overlay" 
        onClick={() => setShowModal(false)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={() => setShowModal(false)}
            aria-label="Close dialog"
          >
            &times;
          </button>
          <h2 id="admin-modal-title">
            {modalType === 'bulk-edit' ? 'Bulk Update Records' : `${editingItem ? 'Edit' : 'Add New'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
          </h2>
          {getForm()}
        </div>
      </div>
    );
  };

  // Get current breadcrumb navigation text
  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'dashboard': return ['Admin', 'Dashboard'];
      case 'activities': return ['Admin', 'Masters', 'Activities'];
      case 'announcements': return ['Admin', 'Masters', 'Announcements'];
      case 'banners': return ['Admin', 'Masters', 'Banner Images'];
      case 'accounts': return ['Admin', 'Transactions', 'Ledgers'];
      case 'income': return ['Admin', 'Transactions', 'Income'];
      case 'expenses': return ['Admin', 'Transactions', 'Expenses'];
      case 'donations': return ['Admin', 'Transactions', 'Donations'];
      case 'reports': return ['Admin', 'Reports & Statements'];
      case 'approvals': return ['Admin', 'Workflows', 'Approvals'];
      case 'messages': return ['Admin', 'Contact Messages'];
      case 'settings': return ['Admin', 'Configuration', 'Site Settings'];
      case 'profile': return ['Admin', 'User Management', 'Profile'];
      default: return ['Admin', activeTab];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="admin-container">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Professional ERP Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Admin Navigation">
        <div className="sidebar-brand">
          <img 
            src="/assets/temple_seal.png" 
            alt="Sringeri SriShankara Mutt Seal" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div className="sidebar-brand-text">
            <h2>Shankara Mutt</h2>
            <span>ERP &bull; Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Main Dashboard Section */}
          <div className="nav-group">
            <button 
              type="button"
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => switchTab('dashboard')}
            >
              <span className="nav-item-content">
                Dashboard
              </span>
            </button>
          </div>

          {/* Masters Group */}
          <div>
            <div className="nav-section-title" onClick={() => toggleGroup('masters')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Masters</span>
              <span>{expandedGroups.masters ? '▾' : '▸'}</span>
            </div>
            {expandedGroups.masters && (
              <div className="nav-group">
                <button 
                  type="button"
                  className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`}
                  onClick={() => switchTab('activities')}
                >
                  <span className="nav-item-content">
                    Activities
                  </span>
                  <span className="nav-badge">{activities.length}</span>
                </button>
                <button 
                  type="button"
                  className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
                  onClick={() => switchTab('announcements')}
                >
                  <span className="nav-item-content">
                    Announcements
                  </span>
                  <span className="nav-badge">{announcements.length}</span>
                </button>
                <button 
                  type="button"
                  className={`nav-item ${activeTab === 'banners' ? 'active' : ''}`}
                  onClick={() => switchTab('banners')}
                >
                  <span className="nav-item-content">
                    Banner Images
                  </span>
                  <span className="nav-badge">{bannerImages.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Transactions Group */}
          <div>
            <div className="nav-section-title" onClick={() => toggleGroup('transactions')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Transactions</span>
              <span>{expandedGroups.transactions ? '▾' : '▸'}</span>
            </div>
            {expandedGroups.transactions && (
              <div className="nav-group">
                <button 
                  type="button"
                  className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
                  onClick={() => switchTab('accounts')}
                >
                  <span className="nav-item-content">
                    Financial Ledgers
                  </span>
                </button>
                <button 
                  type="button"
                  className={`nav-item ${activeTab === 'donations' ? 'active' : ''}`}
                  onClick={() => switchTab('donations')}
                >
                  <span className="nav-item-content">
                    Seva Donations
                  </span>
                  <span className="nav-badge">{donations.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Reports & Statements */}
          <div className="nav-group">
            <div className="nav-section-title">Reports &amp; Approvals</div>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => switchTab('reports')}
            >
              <span className="nav-item-content">
                Reports
              </span>
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => switchTab('approvals')}
            >
              <span className="nav-item-content">
                Approvals
              </span>
              <span className="nav-badge">
                {donations.filter(d => (d.status || '').toLowerCase() === 'pending').length}
              </span>
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => switchTab('messages')}
            >
              <span className="nav-item-content">
                Devotee Messages
              </span>
              <span className="nav-badge">{contactMessages.length}</span>
            </button>
          </div>

          {/* System & User Management */}
          <div className="nav-group">
            <div className="nav-section-title">Administration</div>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => switchTab('settings')}
            >
              <span className="nav-item-content">
                Settings
              </span>
            </button>
            <button 
              type="button"
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => switchTab('profile')}
            >
              <span className="nav-item-content">
                User Management
              </span>
            </button>
            <button 
              type="button"
              className="nav-item"
              onClick={handleLogout}
              style={{ color: '#E57373' }}
            >
              <span className="nav-item-content">
                Sign Out
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{profileForm.name ? profileForm.name[0].toUpperCase() : 'A'}</div>
            <div className="user-details">
              <div className="name">{profileForm.name || 'Admin'}</div>
              <div className="role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main ERP Content Area */}
      <main className="admin-main" role="main">
        {/* Top Navigation Bar */}
        <header className="admin-topbar" role="banner">
          <div className="topbar-left">
            <button 
              type="button" 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            
            {/* Breadcrumb Navigation */}
            <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span aria-hidden="true">&rsaquo;</span>}
                  <span className={idx === breadcrumbs.length - 1 ? 'active' : ''}>{crumb}</span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="topbar-right">
            <ThemeToggle />
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-sm btn-outline"
              title="Open public website in new tab"
            >
              Public Website &rarr;
            </a>
            <button 
              type="button" 
              className="btn btn-sm btn-logout" 
              onClick={handleLogout}
              title="Logout"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="admin-content-area">
          {/* Notification Alert Message */}
          {message.text && (
            <div className={`message ${message.type}`} role="alert">
              <span>{message.text}</span>
            </div>
          )}

          {/* Loading indicator bar */}
          {loading && (
            <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--primary), var(--accent))', width: '100%', marginBottom: '16px', borderRadius: '2px' }} />
          )}

          {/* Pending Verification Notice Banner */}
          {donations.filter(d => (d.status || '').toLowerCase() === 'pending').length > 0 && activeTab !== 'approvals' && (
            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #F59E0B',
                borderRadius: '6px',
                padding: '12px 18px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#92400E'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.3rem' }}>🔔</span>
                <div>
                  <strong>
                    {donations.filter(d => (d.status || '').toLowerCase() === 'pending').length} Devotee Offering(s) Pending Verification
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#B45309' }}>
                    Online payment submitted by devotee. Review and approve to generate official letterhead receipt.
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => switchTab('approvals')}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                Review &amp; Approve &rarr;
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && renderDashboard()}

          {/* TAB 2: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="card-title">Spiritual Activities &amp; Events</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage temple ceremonies, discourses, and special events</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openModal('activity')}>+ Add Activity</button>
              </div>
              {renderDataTable(activities, 'activity', [
                { key: 'title', label: 'Title' },
                { key: 'fromDate', label: 'From Date' },
                { key: 'toDate', label: 'To Date', render: (val) => val || '-' },
                { 
                  key: 'images', 
                  label: 'Media', 
                  render: (value, item) => value && value.length > 0 ? (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); setActiveMedia({ media: value[0], title: item.title }); }}
                    >
                      View File ({value.length})
                    </button>
                  ) : '-' 
                },
                { key: 'description', label: 'Description', render: (val) => val ? (val.length > 40 ? val.substring(0, 40) + '...' : val) : '-' }
              ])}
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="card-title">Official Announcements</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Publish circulars, timings, and sacred notices</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openModal('announcement')}>+ Add Announcement</button>
              </div>
              {renderDataTable(announcements, 'announcement', [
                { key: 'title', label: 'Title' },
                { key: 'fromDate', label: 'Effective Date' },
                { key: 'toDate', label: 'Expires', render: (val) => val || 'Ongoing' },
                { 
                  key: 'images', 
                  label: 'Circular File', 
                  render: (value, item) => value && value.length > 0 ? (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); setActiveMedia({ media: value[0], title: item.title }); }}
                    >
                      View File ({value.length})
                    </button>
                  ) : '-' 
                },
                { key: 'description', label: 'Summary', render: (val) => val ? (val.length > 40 ? val.substring(0, 40) + '...' : val) : '-' }
              ])}
            </div>
          )}

          {/* TAB 4: BANNER IMAGES */}
          {activeTab === 'banners' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="card-title">Homepage Banner Carousel</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage high-resolution banners displayed on public home</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => openModal('banner')}>+ Add Banner</button>
              </div>
              {renderDataTable(bannerImages, 'banner', [
                { key: 'title', label: 'Title' },
                { 
                  key: 'images', 
                  label: 'Preview', 
                  render: (value, item) => value && value.length > 0 ? (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); setActiveMedia({ media: value[0], title: item.title }); }}
                    >
                      View Image ({value.length})
                    </button>
                  ) : 'None' 
                },
                { key: 'description', label: 'Caption', render: (val) => val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '-' }
              ])}
            </div>
          )}

          {/* TAB 5: FINANCIAL LEDGERS */}
          {activeTab === 'accounts' && renderAccounts()}

          {/* TAB 6: SEVA DONATIONS DIRECT VIEW */}
          {activeTab === 'donations' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 className="card-title">Devotee Seva Donations</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Online &amp; offline seva contributions received from devotees</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => handleOpenExcelModal('donation')}>
                    Upload Excel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => openModal('donation')}>
                    + Record Donation
                  </button>
                </div>
              </div>
              {renderDataTable(donations, 'donation', [
                { key: 'donorName', label: 'Donor Name' },
                { key: 'amount', label: 'Amount', render: (val) => <strong style={{ color: '#2E7D32' }}>₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> },
                { key: 'purpose', label: 'Seva Purpose' },
                { key: 'paymentMethod', label: 'Mode' },
                { 
                  key: 'status', 
                  label: 'Status', 
                  render: (val) => {
                    const statusStr = (val || 'received').toLowerCase();
                    if (statusStr === 'received' || statusStr === 'approved') return <span className="status-badge approved">Approved</span>;
                    if (statusStr === 'pending') return <span className="status-badge pending">Pending</span>;
                    return <span className="status-badge rejected">{statusStr}</span>;
                  }
                },
                { key: 'phone', label: 'Phone', render: (val) => val || '-' },
                { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' },
                {
                  key: 'receipt',
                  label: 'Letterhead Receipt',
                  render: (_, item) => {
                    const statusStr = (item.status || 'received').toLowerCase();
                    const isApproved = statusStr === 'received' || statusStr === 'approved';
                    return isApproved ? (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleGenerateReceipt(item)}
                        title="View and print official letterhead receipt"
                      >
                        Receipt
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: '#16A34A',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleUpdateStatus('donations', item, 'received')}
                          title="Verify payment and approve receipt generation"
                        >
                          ✓ Approve &amp; Enable
                        </button>
                      </div>
                    );
                  }
                }
              ])}
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && renderReports()}

          {/* TAB 8: APPROVALS */}
          {activeTab === 'approvals' && renderApprovals()}

          {/* TAB 9: CONTACT MESSAGES */}
          {activeTab === 'messages' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Devotee Contact Inquiries</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Messages submitted through the public website contact portal</p>
              </div>
              {renderDataTable(contactMessages, 'message', [
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email', render: (val) => <a href={`mailto:${val}`}>{val}</a> },
                { key: 'message', label: 'Inquiry Message', render: (val) => val ? (val.length > 50 ? val.substring(0, 50) + '...' : val) : '-' },
                { key: 'date', label: 'Date Received', render: (val) => val ? new Date(val).toLocaleDateString('en-IN') : '-' }
              ])}
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card" style={{ maxWidth: '800px' }}>
              <div className="card-header">
                <h2 className="card-title">Site &amp; Portal Settings</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  Configure site branding, logos, and visual appearance. Active Title: <strong>{settings.siteTitle || 'Kolar Sringeri SriShankara Mutt'}</strong>
                </p>
              </div>
              <form onSubmit={handleSettingsUpdate} className="settings-form" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="form-group">
                  <label htmlFor="set-title" className="form-label">Site Title</label>
                  <input id="set-title" type="text" value={settingsForm.siteTitle || ''} onChange={(e) => setSettingsForm({...settingsForm, siteTitle: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="set-sub" className="form-label">Site Subtitle / Tagline</label>
                  <input id="set-sub" type="text" value={settingsForm.siteSubtitle || ''} onChange={(e) => setSettingsForm({...settingsForm, siteSubtitle: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="set-theme" className="form-label">Visual Design Theme</label>
                  <select id="set-theme" value={settingsForm.theme || 'traditional'} onChange={(e) => setSettingsForm({...settingsForm, theme: e.target.value})} className="form-select">
                    <option value="traditional">Traditional Saffron &amp; Sandalwood</option>
                    <option value="modern">Modern Clean Vedic</option>
                    <option value="minimal">Minimal Corporate</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="set-hero" className="form-label">Hero Background Image</label>
                    <input id="set-hero" type="file" onChange={(e) => setSettingsForm({...settingsForm, heroBackground: e.target.files[0]})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="set-om" className="form-label">Om Emblem / Temple Logo</label>
                    <input id="set-om" type="file" onChange={(e) => setSettingsForm({...settingsForm, omLogo: e.target.files[0]})} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="set-css" className="form-label">Custom CSS Overrides</label>
                  <textarea id="set-css" value={settingsForm.customCSS || ''} onChange={(e) => setSettingsForm({...settingsForm, customCSS: e.target.value})} className="form-textarea" rows="4" placeholder="/* Custom CSS snippets */" />
                </div>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 11: PROFILE & USER MANAGEMENT (CRUD) */}
          {activeTab === 'profile' && (
            <div>
              {/* Administrator Accounts CRUD Management */}
              <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="card-title">Mutt Administrator Accounts (CRUD)</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Create, manage, and update authorized administrative user credentials</p>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => handleOpenAdminModal(null)}>
                    + Add New Administrator
                  </button>
                </div>

                <div className="data-table" style={{ margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Administrator Name</th>
                        <th>Username</th>
                        <th>Email Address</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(admin => (
                        <tr key={admin.id || admin.username}>
                          <td><strong>{admin.name}</strong></td>
                          <td><code>{admin.username}</code></td>
                          <td>{admin.email || '-'}</td>
                          <td>{admin.phone || '-'}</td>
                          <td>
                            <span className={`badge ${admin.role === 'Super Admin' ? 'badge-primary' : 'badge-info'}`}>
                              {admin.role || 'Admin'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${(admin.status || 'active').toLowerCase() === 'active' ? 'approved' : 'rejected'}`}>
                              {admin.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-edit"
                              onClick={() => handleOpenAdminModal(admin)}
                              style={{ marginRight: '6px' }}
                              title="Edit administrator details"
                            >
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-delete"
                              onClick={() => handleDeleteAdminUser(admin.id || admin.username, admin.username)}
                              disabled={adminUsers.length <= 1}
                              title={adminUsers.length <= 1 ? "Cannot delete the sole admin account" : "Delete administrator account"}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Personal Profile & Password Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--spacing-xl)' }}>
                {/* Profile Card */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Admin Account Profile</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Update administrator contact information</p>
                  </div>
                  <form onSubmit={handleProfileUpdate} style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="form-group">
                      <label htmlFor="prof-name" className="form-label">Full Name <span className="required-indicator">*</span></label>
                      <input id="prof-name" type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prof-email" className="form-label">Email Address <span className="required-indicator">*</span></label>
                      <input id="prof-email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Card */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Security &amp; Password</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Change your account password securely</p>
                  </div>
                  <form onSubmit={handlePasswordChange} style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="form-group">
                      <label htmlFor="pass-cur" className="form-label">Current Password <span className="required-indicator">*</span></label>
                      <input id="pass-cur" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pass-new" className="form-label">New Password <span className="required-indicator">*</span></label>
                      <input id="pass-new" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pass-conf" className="form-label">Confirm New Password <span className="required-indicator">*</span></label>
                      <input id="pass-conf" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="form-input" required />
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Admin Item Form Modal */}
      {renderModal()}

      {/* Admin User CRUD Modal */}
      {showAdminUserModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowAdminUserModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-user-modal-title"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setShowAdminUserModal(false)}
              aria-label="Close dialog"
            >
              &times;
            </button>
            <div className="modal-header">
              <h2 id="admin-user-modal-title">
                {editingAdminUser ? 'Edit Administrator Account' : 'Add New Administrator'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {editingAdminUser ? `Editing: ${editingAdminUser.username}` : 'Configure credentials and administrative access level'}
              </p>
            </div>
            <form onSubmit={handleSaveAdminUser} style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">Administrator Full Name <span className="required-indicator">*</span></label>
                <input 
                  type="text" 
                  value={adminUserForm.name} 
                  onChange={(e) => setAdminUserForm({...adminUserForm, name: e.target.value})} 
                  className="form-input" 
                  placeholder="e.g. Srikanth Sharma" 
                  required 
                />
              </div>

              {!editingAdminUser && (
                <div className="form-group">
                  <label className="form-label">Username <span className="required-indicator">*</span></label>
                  <input 
                    type="text" 
                    value={adminUserForm.username} 
                    onChange={(e) => setAdminUserForm({...adminUserForm, username: e.target.value})} 
                    className="form-input" 
                    placeholder="e.g. srikanth or 9876543210" 
                    required 
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  {editingAdminUser ? 'Reset Password (Leave blank to keep current)' : 'Password'} <span className="required-indicator">{editingAdminUser ? '' : '*'}</span>
                </label>
                <input 
                  type="password" 
                  value={adminUserForm.password} 
                  onChange={(e) => setAdminUserForm({...adminUserForm, password: e.target.value})} 
                  className="form-input" 
                  placeholder={editingAdminUser ? "Min 6 characters to reset" : "Min 6 characters"} 
                  required={!editingAdminUser} 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    value={adminUserForm.email} 
                    onChange={(e) => setAdminUserForm({...adminUserForm, email: e.target.value})} 
                    className="form-input" 
                    placeholder="admin@kolarshankaramutt.org" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    value={adminUserForm.phone} 
                    onChange={(e) => setAdminUserForm({...adminUserForm, phone: e.target.value})} 
                    className="form-input" 
                    placeholder="+91 83101 51359" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Administrative Role</label>
                  <select 
                    value={adminUserForm.role} 
                    onChange={(e) => setAdminUserForm({...adminUserForm, role: e.target.value})} 
                    className="form-select"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Seva Manager">Seva Manager</option>
                    <option value="Accounts Officer">Accounts Officer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select 
                    value={adminUserForm.status} 
                    onChange={(e) => setAdminUserForm({...adminUserForm, status: e.target.value})} 
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdminUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingAdminUser ? 'Update Administrator' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Banner Letterhead Receipt Modal */}
      {showReceiptModal && selectedReceiptDonation && (
        <ReceiptModal 
          donation={selectedReceiptDonation} 
          onClose={() => setShowReceiptModal(false)} 
        />
      )}

      {/* Excel Upload & Import Modal */}
      {showExcelModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowExcelModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="excel-upload-title"
        >
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setShowExcelModal(false)}
              aria-label="Close dialog"
            >
              &times;
            </button>
            <h2 id="excel-upload-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
              📊 Excel Bulk Upload
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Import bulk financial transactions from Excel spreadsheet (.xlsx, .xls)
            </p>

            <form onSubmit={handleExcelUpload}>
              {/* Type Selection */}
              <div className="form-group">
                <label className="form-label">Transaction Stream / Category <span className="required-indicator">*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`btn ${excelUploadType === 'donation' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setExcelUploadType('donation')}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    🙏 Devotee Donations
                  </button>
                  <button
                    type="button"
                    className={`btn ${excelUploadType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setExcelUploadType('income')}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    💰 Direct Income
                  </button>
                  <button
                    type="button"
                    className={`btn ${excelUploadType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setExcelUploadType('expense')}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    📤 Expenses
                  </button>
                </div>
              </div>

              {/* Download Template Banner */}
              <div style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                padding: '12px 16px', 
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Sample Excel Template
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {excelUploadType === 'donation' && 'Columns: donorName, amount, purpose, paymentMethod, phone, email, address, date'}
                    {excelUploadType === 'income' && 'Columns: title, amount, category, date, description'}
                    {excelUploadType === 'expense' && 'Columns: title, amount, category, date, description'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleDownloadTemplate(excelUploadType)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ⬇ Download Template
                </button>
              </div>

              {/* File Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="excel-file-input">
                  Select Excel File (.xlsx, .xls) <span className="required-indicator">*</span>
                </label>
                <input 
                  id="excel-file-input"
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={(e) => setExcelFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="form-input" 
                  required
                />
                {excelFile && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--primary)', marginTop: '4px' }}>
                    Selected: <strong>{excelFile.name}</strong> ({(excelFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExcelModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={excelUploading || !excelFile}>
                  {excelUploading ? 'Uploading & Processing...' : `Import ${excelUploadType.charAt(0).toUpperCase() + excelUploadType.slice(1)} Records`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Media Viewer */}
      {activeMedia && (
        <MediaModal 
          media={activeMedia.media} 
          title={activeMedia.title} 
          onClose={() => setActiveMedia(null)} 
        />
      )}
    </div>
  );
}
