// SettingsScreen.js - النسخة المحدثة
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser, getPatientAppointments, cancelAppointmentAPI } from './api';

export default function SettingsScreen({ navigation }) {
  const [trafficAlerts, setTrafficAlerts] = useState(true);
  const [speedCameraAlerts, setSpeedCameraAlerts] = useState(false);
  const [highContrast, setHighContrast] = useState(true);
  const [simpleMode, setSimpleMode] = useState(false);
  const [biggerIcons, setBiggerIcons] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [userName, setUserName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const id = await AsyncStorage.getItem('patientId');
      if (name) setUserName(name);
      if (id) setPatientId(id);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAppointments = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const appointmentsData = await getPatientAppointments(patientId);
      setAppointments(appointmentsData.appointments || []);
      setShowAppointmentsModal(true);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('خطأ', 'فشل في تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'إلغاء الموعد',
      'هل أنت متأكد من إلغاء هذا الموعد؟',
      [
        { text: 'تراجع', style: 'cancel' },
        {
          text: 'تأكيد الإلغاء',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cancelAppointmentAPI(appointmentId, patientId);
              if (result.status === 'success') {
                Alert.alert('✅ تم الإلغاء', 'تم إلغاء الموعد بنجاح');
                // تحديث قائمة المواعيد
                const updatedAppointments = appointments.filter(
                  appt => appt.appointment_id !== appointmentId
                );
                setAppointments(updatedAppointments);
                // تحديث AsyncStorage
                await AsyncStorage.setItem('hasUpcomingAppointment', updatedAppointments.length > 0 ? 'true' : 'false');
              } else {
                Alert.alert('خطأ', 'فشل في إلغاء الموعد');
              }
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert('خطأ', 'تعذر إلغاء الموعد');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('خطأ', 'فشل في تسجيل الخروج');
    }
  };

  const formatArabicDate = (dateString) => {
    const date = new Date(dateString);
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
  };

  const formatArabicTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (hours < 12) {
      return `${hours}:${minutes} صباحاً`;
    } else if (hours === 12) {
      return `${hours}:${minutes} ظهراً`;
    } else {
      return `${hours - 12}:${minutes} مساءً`;
    }
  };

  // دالة لفحص حالة الاتصال
  const checkConnectionStatus = () => {
    Alert.alert(
      'حالة الاتصال',
      patientId ? 
        '✅ أنت مسجل دخول وجاهز لحجز المواعيد' :
        '⚠️ يجب تسجيل الدخول أولاً',
      [{ text: 'موافق' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإعدادات والتحكم</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* معلومات المستخدم */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={50} color="#269237" />
            <View style={styles.userText}>
              <Text style={styles.userName}>{userName || 'زائر'}</Text>
              <Text style={styles.userId}>
                {patientId ? `رقم المريض: ${patientId}` : 'غير مسجل دخول'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={checkConnectionStatus}
          >
            <Text style={styles.statusButtonText}>فحص الحالة</Text>
          </TouchableOpacity>
        </View>

        {/* قسم التحكم في المواعيد */}
        <Text style={styles.sectionTitle}>التحكم في المواعيد</Text>
        
        <RowLink
          label="عرض جميع مواعيدي"
          icon="calendar-outline"
          onPress={loadAppointments}
        />
        
        <RowLink
          label="حجز موعد جديد"
          icon="add-circle-outline"
          onPress={() => navigation.navigate('Appointment')}
        />
        
        <RowLink
          label="إدارة التنبيهات الذكية"
          icon="notifications-outline"
          onPress={() => navigation.navigate('Notifications')}
        />

        {/* قسم الإشعارات */}
        <Text style={styles.sectionTitle}>الإشعارات</Text>

        <RowSwitch
          label="الإشعارات الفورية"
          description="تمكين او اغلاق جميع اشعارات التطبيق"
          value={trafficAlerts}
          onValueChange={setTrafficAlerts}
        />

        <RowSwitch
          label="وضع كبار السن"
          description="نص أكبر واجهة مبسطة لتسهيل الاستخدام"
          value={speedCameraAlerts}
          onValueChange={setSpeedCameraAlerts}
        />

        {/* حجم الخط */}
        <View style={styles.row}>
          <View style={styles.rowTexts}>
            <Text style={styles.rowLabel}>حجم الخط</Text>
            <Text style={styles.rowDescription}>
              تحكم في حجم النص داخل التطبيق
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.fontSizeText}>حجم: {fontSize}px</Text>
          <View style={styles.sliderWrapper}>
            <Text style={styles.sliderLabel}>صغير</Text>
            <View style={styles.sliderTrack}>
              <View 
                style={[
                  styles.sliderFill, 
                  { width: `${((fontSize - 12) / 10) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.sliderLabel}>كبير</Text>
          </View>
        </View>

        {/* قسم المظهر */}
        <Text style={styles.sectionTitle}>تباين الألوان</Text>

        <RowSwitch
          label="ألوان عالية التباين"
          value={highContrast}
          onValueChange={setHighContrast}
        />

        <RowSwitch
          label="نمط مبسط"
          value={simpleMode}
          onValueChange={setSimpleMode}
        />

        <RowSwitch
          label="تكبير الأيقونات"
          value={biggerIcons}
          onValueChange={setBiggerIcons}
        />

        {/* الخصوصية */}
        <Text style={styles.sectionTitle}>الخصوصية والأمان</Text>

        <RowLink
          label="سياسة الخصوصية"
          icon="shield-checkmark-outline"
          onPress={() => navigation.navigate('Privacy')}
        />

        {/* روابط أسفل الصفحة */}
        <RowLink
          label="تواصل معنا"
          icon="call-outline"
          onPress={() => navigation.navigate('ContactUs')}
        />
        
        <RowLink
          label="شروط الخدمة"
          icon="document-text-outline"
          onPress={() => navigation.navigate('Terms')}
        />
        
        <RowLink
          label="الأسئلة الشائعة"
          icon="help-circle-outline"
          onPress={() => navigation.navigate('FAQ')}
        />

        {/* تسجيل الخروج */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>تطبيق تراص - الإصدار 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Modal لعرض المواعيد */}
      <Modal
        visible={showAppointmentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAppointmentsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>جميع مواعيدك</Text>
              <TouchableOpacity onPress={() => setShowAppointmentsModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color="#269237" style={styles.loader} />
            ) : appointments.length === 0 ? (
              <View style={styles.noAppointmentsContainer}>
                <Ionicons name="calendar-outline" size={60} color="#6c757d" />
                <Text style={styles.noAppointmentsText}>لا توجد مواعيد حالياً</Text>
                <Text style={styles.noAppointmentsSubtext}>
                  يمكنك حجز موعد جديد من خلال زر "حجز موعد جديد"
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.appointmentsList}>
                {appointments.map((appointment, index) => (
                  <View key={appointment.appointment_id || index} style={styles.appointmentItem}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentService}>
                        <Ionicons 
                          name={appointment.service_type === 'اصدار جواز السفر' ? 'airplane-outline' : 'id-card-outline'} 
                          size={20} 
                          color="#269237" 
                        />
                        <Text style={styles.appointmentServiceText}>
                          {appointment.service_type || 'اصدار الهوية'}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        appointment.status === 'booked' ? styles.statusBooked : 
                        appointment.status === 'cancelled' ? styles.statusCancelled : styles.statusAvailable
                      ]}>
                        <Text style={styles.statusText}>
                          {appointment.status === 'booked' ? 'مؤكد' : 
                           appointment.status === 'cancelled' ? 'ملغى' : 'متاح'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.appointmentDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {formatArabicDate(appointment.datetime)}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {formatArabicTime(appointment.datetime)}
                        </Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {appointment.center_name || `المركز ${appointment.center_id}`}
                        </Text>
                      </View>
                    </View>
                    
                    {appointment.status === 'booked' && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelAppointment(appointment.appointment_id)}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#fff" />
                        <Text style={styles.cancelButtonText}>إلغاء الموعد</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAppointmentsModal(false)}
            >
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal لتسجيل الخروج */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.logoutModalContent}>
            <Ionicons name="log-out-outline" size={60} color="#dc3545" />
            <Text style={styles.logoutModalTitle}>تسجيل الخروج</Text>
            <Text style={styles.logoutModalText}>
              هل أنت متأكد من تسجيل الخروج؟
            </Text>
            <Text style={styles.logoutModalSubtext}>
              سيتم حذف جميع بيانات الجلسة المحلية
            </Text>
            
            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonText}>تراجع</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>تسجيل الخروج</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// صف يحتوي على سويتش
function RowSwitch({ label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTexts}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? (
          <Text style={styles.rowDescription}>{description}</Text>
        ) : null}
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#269237' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

// صف ينقل لصفحة أخرى
function RowLink({ label, icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.rowTexts}>
        <View style={styles.rowIconText}>
          <Ionicons name={icon} size={22} color="#269237" />
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  back: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  userId: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  statusButton: {
    backgroundColor: '#269237',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    textAlign: 'right',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowIconText: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  rowTexts: {
    flex: 1,
    marginLeft: 8,
  },
  rowLabel: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  rowDescription: {
    textAlign: 'right',
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  fontSizeText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#269237',
    borderRadius: 3,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginVertical: 40,
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAppointmentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  noAppointmentsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  appointmentsList: {
    maxHeight: 400,
  },
  appointmentItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  appointmentHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentService: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  appointmentServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBooked: {
    backgroundColor: '#d4edda',
  },
  statusCancelled: {
    backgroundColor: '#f8d7da',
  },
  statusAvailable: {
    backgroundColor: '#d1ecf1',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Logout Modal
  logoutModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  logoutModalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  logoutModalSubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 25,
  },
  logoutModalActions: {
    flexDirection: 'row-reverse',
    gap: 15,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalConfirmButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});