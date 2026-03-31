const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

if (!API_URL) {
  console.error('[CRITICAL] VITE_API_URL is missing! API requests will fail.');
}
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  console.log(`[apiFetch] Requesting: ${url}`, { hasToken: !!token });
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    const response = await fetch(url, { ...options, headers });
    console.log(`[apiFetch] Response: ${url} -> Status: ${response.status}`);
    
    if (response.status === 401) {
      console.warn(`[apiFetch] Session Expired (401) at ${url}. Clearing session.`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again');
    }
    
    if (response.status === 403) {
      console.error(`[apiFetch] Access Forbidden (403) at ${url}. Possible ID mismatch or permission issue.`);
      // Optional: Don't force logout on 403, just throw the error
      throw new Error('Access forbidden. You do not have permission to access this resource.');
    }
    
    return response;
  } catch (err) {
    console.error(`[apiFetch] Fetch Error at ${url}:`, err);
    throw err;
  }
};

export const apiService = {
  // User Profile
  getProfile: async () => {
    const response = await apiFetch(`${API_URL}/users/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  getUserProfile: async (userId: string) => {
    // Deprecated for simple retrieval, but kept for onboarding compatibility
    const response = await apiFetch(`${API_URL}/auth/onboarding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  getUserReport: async (userId: string) => {
    const response = await apiFetch(`${API_URL}/users/${userId}/report`);
    if (!response.ok) throw new Error('Failed to fetch user report');
    return response.json();
  },

  // Dashboard
  getDashboardStats: async (userId: string) => {
    if (!userId || userId === 'undefined') {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      userId = savedUser.id || savedUser._id || userId;
    }
    const response = await apiFetch(`${API_URL}/dashboard/stats/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  getChapterStats: async (chapter: string) => {
    const response = await apiFetch(`${API_URL}/chapters/stats/${chapter}`);
    if (!response.ok) throw new Error('Failed to fetch chapter stats');
    return response.json();
  },

  // Referrals
  getReferrals: async (userId: string) => {
    if (!userId || userId === 'undefined') {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      userId = savedUser.id || savedUser._id || userId;
    }
    const response = await apiFetch(`${API_URL}/referrals/my/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch referrals');
    return response.json();
  },

  createReferral: async (referralData: any) => {
    const response = await apiFetch(`${API_URL}/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralData)
    });
    if (!response.ok) throw new Error('Failed to create referral');
    return response.json();
  },

  updateReferral: async (referralId: string, updateData: any) => {
    const response = await apiFetch(`${API_URL}/referrals/${referralId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update referral');
    return response.json();
  },

  // Meetings
  getMeetings: async (chapterId?: string) => {
    const url = chapterId
      ? `${API_URL}/meetings?chapterId=${encodeURIComponent(chapterId)}`
      : `${API_URL}/meetings`;
    const response = await apiFetch(url);
    if (!response.ok) throw new Error('Failed to fetch meetings');
    return response.json();
  },

  getUpcomingMeeting: async () => {
    const response = await apiFetch(`${API_URL}/meetings/upcoming`);
    if (!response.ok) throw new Error('Failed to fetch upcoming meeting');
    return response.json();
  },

  markAttendance: async (meetingId: string) => {
    const response = await apiFetch(`${API_URL}/meetings/${meetingId}/mark-attendance`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to mark attendance');
    return response.json();
  },

  updateAttendance: async (meetingId: string, attendance: any[]) => {
    const response = await apiFetch(`${API_URL}/meetings/${meetingId}/attendance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance })
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return response.json();
  },

  createMeeting: async (meetingData: any) => {
    const response = await apiFetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to create meeting');
    return response.json();
  },

  updateMeeting: async (meetingId: string, meetingData: any) => {
    const response = await apiFetch(`${API_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to update meeting');
    return response.json();
  },

  getMeetingGuests: async (meetingId: string) => {
    const response = await apiFetch(`${API_URL}/meetings/${meetingId}/guests`);
    if (!response.ok) throw new Error('Failed to fetch meeting guests');
    return response.json();
  },

  getChapterApprovals: async (chapter: string) => {
    const response = await apiFetch(`${API_URL}/approvals/chapter/${chapter}`);
    if (!response.ok) throw new Error('Failed to fetch pending approvals');
    return response.json();
  },

  updateUserStatus: async (userId: string, status: 'Approved' | 'Rejected') => {
    const response = await apiFetch(`${API_URL}/approvals/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update user status');
    return response.json();
  },

  getChapterAnalytics: async (chapter: string) => {
    const response = await apiFetch(`${API_URL}/chapter/analytics/${chapter}`);
    if (!response.ok) throw new Error('Failed to fetch chapter analytics');
    return response.json();
  },

  getAdminSystemStats: async () => {
    const response = await apiFetch(`${API_URL}/admin/system-stats`);
    if (!response.ok) throw new Error('Failed to fetch platform stats');
    return response.json();
  },

  getAdminUsers: async () => {
    const response = await apiFetch(`${API_URL}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch platform users');
    return response.json();
  },

  getAdminUserById: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  },

  createAdminUser: async (userData: any) => {
    const response = await apiFetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateAdminUser: async (id: string, userData: any) => {
    const response = await apiFetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteAdminUser: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Chapters
  getAdminChapters: async () => {
    const response = await apiFetch(`${API_URL}/admin/chapters`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    return response.json();
  },

  createAdminChapter: async (chapterData: any) => {
    const response = await apiFetch(`${API_URL}/admin/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData)
    });
    if (!response.ok) throw new Error('Failed to create chapter');
    return response.json();
  },

  updateAdminChapter: async (id: string, chapterData: any) => {
    const response = await apiFetch(`${API_URL}/admin/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData)
    });
    if (!response.ok) throw new Error('Failed to update chapter');
    return response.json();
  },

  deactivateAdminChapter: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/chapters/${id}/deactivate`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to deactivate chapter');
    return response.json();
  },

  // Referrals (Admin)
  getAdminReferrals: async () => {
    const response = await apiFetch(`${API_URL}/admin/referrals`);
    if (!response.ok) throw new Error('Failed to fetch referrals');
    return response.json();
  },

  updateAdminReferralStatus: async (id: string, status: string) => {
    const response = await apiFetch(`${API_URL}/admin/referrals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update referral status');
    return response.json();
  },

  deleteAdminReferral: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/referrals/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete referral');
    return response.json();
  },

  exportAdminReferrals: async () => {
    const response = await apiFetch(`${API_URL}/admin/referrals/export`);
    if (!response.ok) throw new Error('Failed to export referrals');
    return response.json();
  },

  // Meetings (Admin)
  createAdminMeeting: async (meetingData: any) => {
    const response = await apiFetch(`${API_URL}/admin/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to create meeting');
    return response.json();
  },

  updateAdminMeeting: async (id: string, meetingData: any) => {
    const response = await apiFetch(`${API_URL}/admin/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to update meeting');
    return response.json();
  },

  deleteAdminMeeting: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/meetings/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete meeting');
    return response.json();
  },

  getUpcomingMeetings: async () => {
    const response = await apiFetch(`${API_URL}/admin/meetings/upcoming`);
    if (!response.ok) throw new Error('Failed to fetch upcoming meetings');
    return response.json();
  },

  getMeetingHistory: async () => {
    const response = await apiFetch(`${API_URL}/admin/meetings/history`);
    if (!response.ok) throw new Error('Failed to fetch meeting history');
    return response.json();
  },

  // Reports (Admin)
  getReferralGrowthReport: async () => {
    const response = await apiFetch(`${API_URL}/admin/reports/referral-growth`);
    if (!response.ok) throw new Error('Failed to fetch referral growth report');
    return response.json();
  },

  getRevenueVelocityReport: async () => {
    const response = await apiFetch(`${API_URL}/admin/reports/revenue-velocity`);
    if (!response.ok) throw new Error('Failed to fetch revenue velocity report');
    return response.json();
  },

  getMemberRetentionReport: async () => {
    const response = await apiFetch(`${API_URL}/admin/reports/member-retention`);
    if (!response.ok) throw new Error('Failed to fetch member retention report');
    return response.json();
  },

  getChapterEfficiencyReport: async () => {
    const response = await apiFetch(`${API_URL}/admin/reports/chapter-efficiency`);
    if (!response.ok) throw new Error('Failed to fetch chapter efficiency report');
    return response.json();
  },

  exportAllReports: async () => {
    const response = await apiFetch(`${API_URL}/admin/reports/export-all`);
    if (!response.ok) throw new Error('Failed to export all reports');
    return response.blob();
  },

  syncMeetings: async () => {
    const response = await apiFetch(`${API_URL}/admin/meetings/sync`);
    if (!response.ok) throw new Error('Failed to sync meetings');
    return response.json();
  },

  getUserStatus: async () => {
    const response = await apiFetch(`${API_URL}/users/me/status`);
    if (!response.ok) throw new Error('Failed to fetch user status');
    return response.json();
  },

  // Notifications (Admin)
  broadcastNotification: async (data: { message: string, recipientType: 'GLOBAL' | 'CHAPTER', chapterId?: string, adminId: string }) => {
    const response = await apiFetch(`${API_URL}/admin/notifications/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to dispatch broadcast');
    return response.json();
  },

  getSystemAlerts: async () => {
    const response = await apiFetch(`${API_URL}/admin/system-alerts`);
    if (!response.ok) throw new Error('Failed to fetch system alerts');
    return response.json();
  },

  // Platform Settings (Admin)
  getPlatformSettings: async () => {
    const response = await apiFetch(`${API_URL}/admin/settings`);
    if (!response.ok) throw new Error('Failed to fetch platform settings');
    return response.json();
  },

  updatePlatformSettings: async (settings: any) => {
    const response = await apiFetch(`${API_URL}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update platform settings');
    return response.json();
  },

  updateSecuritySettings: async (settings: any) => {
    const response = await apiFetch(`${API_URL}/admin/settings/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update security settings');
    return response.json();
  },

  updateNotificationSettings: async (settings: any) => {
    const response = await apiFetch(`${API_URL}/admin/settings/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update notification settings');
    return response.json();
  },

  inviteGuest: async (meetingId: string, guestData: any) => {
    const response = await apiFetch(`${API_URL}/meetings/${meetingId}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingId ? { ...guestData, meetingId } : guestData)
    });
    if (!response.ok) throw new Error('Failed to invite guest');
    return response.json();
  },

  getChapterMeetings: async (chapter: string) => {
    const response = await apiFetch(`${API_URL}/meetings/chapter/${chapter}`);
    if (!response.ok) throw new Error('Failed to fetch meetings');
    return response.json();
  },

  // Chapter Members
  getChapterMembers: async (chapter: string) => {
    const response = await apiFetch(`${API_URL}/chapters/members/${chapter}`);
    if (!response.ok) throw new Error('Failed to fetch chapter members');
    return response.json();
  },

  // Notifications
  getNotifications: async (userId: string) => {
    const response = await apiFetch(`${API_URL}/notifications/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  getUnreadNotificationCount: async (userId: string) => {
    const response = await apiFetch(`${API_URL}/notifications/${userId}/unread-count`);
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await apiFetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  markAllNotificationsRead: async (userId: string) => {
    const response = await apiFetch(`${API_URL}/notifications/mark-all-read/${userId}`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await apiFetch(`${API_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  // Profile
  getUserProfileFull: async (userId: string) => {
    const response = await apiFetch(`${API_URL}/users/profile/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch profile stats');
    return response.json();
  },

  updateUserProfile: async (userId: string, data: any) => {
    const response = await apiFetch(`${API_URL}/users/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // File Upload
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('File upload failed');
    return response.json();
  },

  uploadProfileImage: async (userId: string, file: File) => {
    const uploadRes = await apiService.uploadFile(file);
    if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
    
    return apiService.updateUserProfile(userId, { profileImage: uploadRes.url });
  },

  uploadSpotlightVideo: async (userId: string, file: File) => {
    const uploadRes = await apiService.uploadFile(file);
    if (!uploadRes.success) throw new Error(uploadRes.message || 'Upload failed');
    
    return apiService.updateUserProfile(userId, { portfolioVideo: uploadRes.url });
  },

  // Payments
  createPaymentOrder: async (data: { amount: number, feature: string, userId: string }) => {
    const response = await apiFetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create payment order');
    return response.json();
  },

  verifyPayment: async (verificationData: { 
    razorpay_order_id: string, 
    razorpay_payment_id: string, 
    razorpay_signature: string 
  }) => {
    const response = await apiFetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    if (!response.ok) throw new Error('Payment verification failed');
    return response.json();
  },

  getPaymentLogs: async () => {
    const response = await apiFetch(`${API_URL}/payments/admin/logs`);
    if (!response.ok) throw new Error('Failed to fetch payment logs');
    return response.json();
  },

  // Support System
  submitSupportMessage: async (data: any) => {
    const response = await fetch(`${API_URL}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  getAdminSupportMessages: async () => {
    const response = await apiFetch(`${API_URL}/admin/support`);
    if (!response.ok) throw new Error('Failed to fetch support messages');
    return response.json();
  },

  updateAdminSupportStatus: async (id: string, status: 'Pending' | 'Solved') => {
    const response = await apiFetch(`${API_URL}/admin/support/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  deleteAdminSupportMessage: async (id: string) => {
    const response = await apiFetch(`${API_URL}/admin/support/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return response.json();
  },
};
