// api.js - النسخة الكاملة المحدثة
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== إعدادات الاتصال ====================
// Web browser (React Native Web):
const BASE_URL = 'http://localhost:8000';
// const BASE_URL = 'http://10.0.2.2:8000';  // لمحاكي Android
// const BASE_URL = 'http://localhost:8000'; // لمحاكي iOS
// const BASE_URL = 'http://192.168.1.100:8000'; // للجهاز الفعلي

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar-SA'
  }
});

// ==================== Interceptor للمصادقة ====================
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== APIs للمراكز ====================
export const getAvailableCenters = async () => {
  try {
    const response = await API.get('/centers');
    console.log('Centers response:', response.data);
    return response.data.centers || [];
  } catch (error) {
    console.error('Error fetching centers:', error);
    // بيانات وهمية للطوارئ
    return getMockCenters();
  }
};

export const searchCentersByName = async (searchTerm) => {
  try {
    const centers = await getAvailableCenters();
    if (!searchTerm.trim()) return centers;
    
    return centers.filter(center => 
      center.name?.includes(searchTerm) || 
      center.city?.includes(searchTerm) ||
      center.center_id?.toString().includes(searchTerm)
    );
  } catch (error) {
    console.error('Search centers error:', error);
    throw error;
  }
};

// ==================== APIs للمواعيد المتاحة (النموذج الأول) ====================
export const getAvailableAppointments = async (centerId) => {
  try {
    console.log('Fetching appointments for center:', centerId);
    const response = await API.post('/appointments/available', {
      center_id: centerId
    });
    console.log('Available appointments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching available appointments:', error);
    // بيانات وهمية للطوارئ
    return getMockAppointments(centerId);
  }
};

// ==================== APIs للتنبؤ بعدم الحضور (النموذج الثاني) ====================
export const predictNoShow = async (patientId, appointmentId, centerId) => {
  try {
    const response = await API.post('/predict/no-show', {
      patient_id: patientId,
      appointment_id: appointmentId,
      center_id: centerId
    });
    console.log('No-show prediction response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error predicting no-show:', error);
    // بيانات وهمية للطوارئ
    return getMockNoShowPrediction(patientId, appointmentId, centerId);
  }
};

// ==================== APIs لحجز المواعيد ====================
export const bookAppointmentAPI = async (appointmentData) => {
  try {
    const response = await API.post('/appointments/book', appointmentData);
    console.log('Book appointment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const cancelAppointmentAPI = async (appointmentId, patientId) => {
  try {
    const response = await API.post('/appointments/cancel', {
      appointment_id: appointmentId,
      patient_id: patientId,
      action: 'cancel'
    });
    console.log('Cancel appointment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
};

export const rescheduleAppointmentAPI = async (oldAppointmentId, newAppointmentId, patientId) => {
  try {
    const response = await API.post('/appointments/reschedule', {
      old_appointment_id: oldAppointmentId,
      new_appointment_id: newAppointmentId,
      patient_id: patientId
    });
    console.log('Reschedule appointment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }
};

// ==================== APIs للصحة والتواصل ====================
export const healthCheck = async () => {
  try {
    const response = await API.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error.message,
      database: 'disconnected'
    };
  }
};

export const getApiStatus = async () => {
  try {
    const health = await healthCheck();
    const centers = await getAvailableCenters();
    
    return {
      connected: true,
      backend_url: BASE_URL,
      health_status: health.status,
      database: health.database || 'connected',
      centers_count: centers.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      backend_url: BASE_URL,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// ==================== APIs للمريض ====================
export const getPatientAppointments = async (patientId) => {
  try {
    const response = await API.get(`/appointments/${patientId}`);
    console.log('Patient appointments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    
    // بيانات وهمية للطوارئ
    return getMockPatientAppointments(patientId);
  }
};

// ==================== APIs للمصادقة ====================
export const loginUser = async (nationalId, password) => {
  try {
    if (nationalId && password) {
      // إنشاء patientId فريد بناءً على رقم الهوية
      const patientId = `PAT${nationalId.slice(-6)}`;
      
      await AsyncStorage.setItem('userToken', 'dummy_token_123');
      await AsyncStorage.setItem('userNationalId', nationalId);
      await AsyncStorage.setItem('userName', 'محمد أحمد');
      await AsyncStorage.setItem('patientId', patientId);
      await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
      
      return {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: 1,
          name: 'محمد أحمد',
          nationalId: nationalId,
          patientId: patientId
        }
      };
    }
    throw new Error('الرجاء إدخال بيانات صحيحة');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userNationalId');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('patientId');
    await AsyncStorage.removeItem('hasUpcomingAppointment');
    return { success: true, message: 'تم تسجيل الخروج' };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const nationalId = await AsyncStorage.getItem('userNationalId');
    const userName = await AsyncStorage.getItem('userName');
    const patientId = await AsyncStorage.getItem('patientId');
    
    if (!nationalId) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    return {
      id: 1,
      name: userName || 'محمد أحمد',
      nationalId: nationalId,
      patientId: patientId || `PAT${nationalId.slice(-6)}`,
      email: 'user@example.com',
      phone: '+966500000000'
    };
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// ==================== دوال مساعدة ====================
export const getCityByCenterId = (centerId) => {
  const cityMap = {
    '101': 'الرياض',
    '102': 'جدة', 
    '103': 'الدمام',
    '104': 'مكة المكرمة',
    '105': 'المدينة المنورة',
    '106': 'الخبر',
    '107': 'الطائف',
    '108': 'بريدة',
    '109': 'تبوك',
    '110': 'أبها'
  };
  return cityMap[centerId] || `المركز ${centerId}`;
};

export const formatArabicDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'تاريخ غير معروف';
    }
    
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const arabicDays = [
      'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 
      'الخميس', 'الجمعة', 'السبت'
    ];
    
    const day = arabicDays[date.getDay()];
    const dayNum = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}، ${dayNum} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'تاريخ غير معروف';
  }
};

export const formatArabicTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'وقت غير معروف';
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (hours < 12) {
      return `${hours}:${minutes} صباحاً`;
    } else if (hours === 12) {
      return `${hours}:${minutes} ظهراً`;
    } else {
      return `${hours - 12}:${minutes} مساءً`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'وقت غير معروف';
  }
};

// ==================== بيانات وهمية للطوارئ ====================
const getMockCenters = () => {
  return [
    {
      id: '101',
      name: 'مركز الأحوال المدنية - الرياض',
      center_id: '101',
      city: 'الرياض',
      address: 'شارع الملك فهد - الرياض',
      phone: '0112345678',
      working_hours: '8:00 ص - 4:00 م'
    },
    {
      id: '102',
      name: 'مركز الأحوال المدنية - جدة',
      center_id: '102',
      city: 'جدة',
      address: 'شارع الأمير سلطان - جدة',
      phone: '0123456789',
      working_hours: '8:00 ص - 4:00 م'
    },
    {
      id: '103',
      name: 'مركز الأحوال المدنية - الدمام',
      center_id: '103',
      city: 'الدمام',
      address: 'شارع الملك عبدالله - الدمام',
      phone: '0134567890',
      working_hours: '8:00 ص - 4:00 م'
    },
    {
      id: '104',
      name: 'مركز الأحوال المدنية - مكة',
      center_id: '104',
      city: 'مكة المكرمة',
      address: 'شارع العزيزية - مكة',
      phone: '0145678901',
      working_hours: '8:00 ص - 4:00 م'
    },
    {
      id: '105',
      name: 'مركز الأحوال المدنية - المدينة',
      center_id: '105',
      city: 'المدينة المنورة',
      address: 'شارع سلطانه - المدينة',
      phone: '0156789012',
      working_hours: '8:00 ص - 4:00 م'
    }
  ];
};

const getMockAppointments = (centerId) => {
  const today = new Date();
  const slots = [];
  
  for (let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // موعد صباحي
    const morningDate = new Date(date);
    morningDate.setHours(9, 0, 0, 0);
    
    slots.push({
      appointment_id: `APP_${centerId}_${i}_MORNING`,
      datetime: morningDate.toISOString(),
      date_arabic: formatArabicDate(morningDate),
      time_arabic: '9:00 صباحاً',
      is_peak_hour: true,
      estimated_wait_time: 30,
      service_type: 'اصدار الهوية',
      center_id: centerId,
      status: 'available'
    });
    
    // موعد مسائي
    const afternoonDate = new Date(date);
    afternoonDate.setHours(14, 30, 0, 0);
    
    slots.push({
      appointment_id: `APP_${centerId}_${i}_AFTERNOON`,
      datetime: afternoonDate.toISOString(),
      date_arabic: formatArabicDate(afternoonDate),
      time_arabic: '2:30 مساءً',
      is_peak_hour: false,
      estimated_wait_time: 15,
      service_type: 'اصدار الهوية',
      center_id: centerId,
      status: 'available'
    });
  }
  
  const bestSlot = slots.find(slot => !slot.is_peak_hour && slot.estimated_wait_time === 15);
  
  return {
    center_id: centerId,
    center_name: `مركز الأحوال المدنية - ${getCityByCenterId(centerId)}`,
    available_slots: slots,
    total_slots: slots.length,
    best_slot: bestSlot || slots[0],
    message: `تم العثور على ${slots.length} موعد متاح`
  };
};

const getMockNoShowPrediction = (patientId, appointmentId, centerId) => {
  const probabilities = [0.65, 0.45, 0.25];
  const probability = probabilities[Math.floor(Math.random() * probabilities.length)];
  
  let riskLevel, recommendation, message;
  
  if (probability >= 0.6) {
    riskLevel = "عالي";
    recommendation = "إلغاء";
    message = "احتمالية عالية لعدم الحضور. يوصى بإرسال تنبيه عاجل للمريض للتفكير في الإلغاء";
  } else if (probability >= 0.3) {
    riskLevel = "متوسط";
    recommendation = "تأكيد";
    message = "احتمالية متوسطة لعدم الحضور. يوصى بإرسال تنبيه تأكيدي للمريض";
  } else {
    riskLevel = "منخفض";
    recommendation = "متابعة";
    message = "احتمالية منخفضة لعدم الحضور. الموعد طبيعي، لا داعي للتنبيه";
  }
  
  return {
    patient_id: patientId,
    appointment_id: appointmentId,
    no_show_probability: probability,
    risk_level: riskLevel,
    historical_no_show_rate: probability * 0.8,
    recommendation: recommendation,
    message: message
  };
};

const getMockPatientAppointments = (patientId) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const appointments = [
    {
      appointment_id: `APP_101_${Date.now()}`,
      patient_id: patientId,
      center_id: '101',
      center_name: 'مركز الأحوال المدنية - الرياض',
      datetime: tomorrow.toISOString(),
      service_type: 'اصدار الهوية',
      status: 'booked'
    },
    {
      appointment_id: `APP_102_${Date.now() - 86400000}`,
      patient_id: patientId,
      center_id: '102',
      center_name: 'مركز الأحوال المدنية - جدة',
      datetime: new Date(today.getTime() - 86400000).toISOString(), // يوم أمس
      service_type: 'اصدار الهوية',
      status: 'cancelled'
    },
    {
      appointment_id: `APP_103_${Date.now() + 172800000}`,
      patient_id: patientId,
      center_id: '103',
      center_name: 'مركز الأحوال المدنية - الدمام',
      datetime: nextWeek.toISOString(),
      service_type: 'اصدار جواز السفر',
      status: 'booked'
    }
  ];
  
  return {
    patient_id: patientId,
    appointments: appointments,
    count: appointments.length
  };
};

// ==================== تصدير الـ API الرئيسي ====================
export default API;