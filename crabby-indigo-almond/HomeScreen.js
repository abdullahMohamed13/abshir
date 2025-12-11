// HomeScreen.js - النسخة الكاملة المحدثة
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatientAppointments, getApiStatus } from "./api";

export default function HomeScreen({ navigation }) {
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("زائر");
  const [patientId, setPatientId] = useState(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [hasAppointments, setHasAppointments] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  // جلب بيانات المستخدم والمواعيد عند فتح الشاشة
  useEffect(() => {
    loadUserDataAndAppointments();
    
    // استماع لتحديث المواعيد عند العودة للشاشة
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserDataAndAppointments();
    });

    return unsubscribe;
  }, [navigation]);

  // جلب بيانات المستخدم والمواعيد
  const loadUserDataAndAppointments = async () => {
    try {
      setLoading(true);
      
      // فحص اتصال Backend
      const status = await getApiStatus();
      setBackendConnected(status.connected);
      
      // جلب بيانات المستخدم من AsyncStorage
      const name = await AsyncStorage.getItem('userName');
      const storedPatientId = await AsyncStorage.getItem('patientId');
      
      if (name) setUserName(name.replace('!', ''));
      if (storedPatientId) {
        setPatientId(storedPatientId);
        await loadUpcomingAppointment(storedPatientId);
      } else {
        setUpcomingAppointment(null);
        setTotalAppointments(0);
        setHasAppointments(false);
        setUpcomingCount(0);
        setCancelledCount(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUpcomingAppointment(null);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // جلب الموعد القادم للمريض
  const loadUpcomingAppointment = async (patientId) => {
    try {
      const appointmentsData = await getPatientAppointments(patientId);
      
      if (appointmentsData.appointments && appointmentsData.appointments.length > 0) {
        // ترتيب المواعيد حسب التاريخ (الأقرب أولاً) واستبعاد الملغاة
        const validAppointments = appointmentsData.appointments
          .filter(appt => appt.status === 'booked')
          .sort((a, b) => {
            return new Date(a.datetime) - new Date(b.datetime);
          });
        
        // جميع المواعيد
        const allAppointments = appointmentsData.appointments;
        setTotalAppointments(allAppointments.length);
        
        // إحصائيات
        const upcoming = allAppointments.filter(a => a.status === 'booked').length;
        const cancelled = allAppointments.filter(a => a.status === 'cancelled').length;
        setUpcomingCount(upcoming);
        setCancelledCount(cancelled);
        
        setHasAppointments(validAppointments.length > 0);
        
        if (validAppointments.length > 0) {
          // أخذ أول موعد (الأقرب)
          const nextAppointment = validAppointments[0];
          
          // تحويل البيانات للشكل المناسب
          setUpcomingAppointment({
            id: nextAppointment.appointment_id,
            date: formatDate(nextAppointment.datetime),
            time: formatTime(nextAppointment.datetime),
            center: nextAppointment.center_name || `المركز ${nextAppointment.center_id}`,
            service: nextAppointment.service_type || 'اصدار الهوية',
            status: nextAppointment.status || 'booked',
            datetime: nextAppointment.datetime,
            originalData: nextAppointment
          });
          
          // تحديث AsyncStorage أن هناك موعد قادم
          await AsyncStorage.setItem('hasUpcomingAppointment', 'true');
        } else {
          setUpcomingAppointment(null);
          await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
        }
      } else {
        setUpcomingAppointment(null);
        setTotalAppointments(0);
        setHasAppointments(false);
        setUpcomingCount(0);
        setCancelledCount(0);
        await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
      }
    } catch (error) {
      console.error('Error loading upcoming appointment:', error);
      setUpcomingAppointment(null);
      await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'تاريخ غير معروف';
      
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
      return 'تاريخ غير معروف';
    }
  };

  // تنسيق الوقت
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'وقت غير معروف';
      
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
      return 'وقت غير معروف';
    }
  };

  // تحديث البيانات
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserDataAndAppointments();
    setRefreshing(false);
  };

  // معالجة الضغط على إدارة المواعيد
  const handleManageAppointments = () => {
    navigation.navigate("NotificationsTab", {
      screen: 'Notifications',
      params: { 
        patientId: patientId,
        hasUpcomingAppointment: !!upcomingAppointment
      }
    });
  };

  // معالجة الضغط على حجز موعد
  const handleBookAppointment = () => {
    if (!patientId) {
      Alert.alert(
        "يجب تسجيل الدخول",
        "يجب تسجيل الدخول أولاً لحجز موعد",
        [
          { text: "إلغاء", style: "cancel" },
          { 
            text: "تسجيل الدخول", 
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
      return;
    }
    navigation.navigate("Appointment");
  };

  // معالجة الضغط على تسجيل الدخول
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  // فحص حالة المواعيد
  const handleCheckStatus = async () => {
    try {
      const hasAppointment = await AsyncStorage.getItem('hasUpcomingAppointment');
      
      let message = '';
      if (!patientId) {
        message = '⚠️ يجب تسجيل الدخول أولاً للاستفادة من خدمات التطبيق';
      } else if (!backendConnected) {
        message = '⚠️ التطبيق يعمل في الوضع التجريبي\nبعض الخدمات قد لا تكون متاحة';
      } else if (hasAppointment === 'true') {
        message = `✅ لديك ${upcomingCount} موعد قادم\nيمكنك إدارته من قسم "المواعيد"`;
      } else {
        message = '📅 لا توجد مواعيد قادمة\nيمكنك حجز موعد جديد الآن';
      }
      
      Alert.alert('حالة المواعيد', message, [{ text: 'موافق' }]);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  // عرض تفاصيل الموعد القادم
  const renderUpcomingAppointment = () => {
    if (!upcomingAppointment) {
      return (
        <View style={styles.noAppointmentCard}>
          <Ionicons name="calendar-outline" size={50} color="#6c757d" />
          <Text style={styles.noAppointmentTitle}>لا يوجد موعد قادم</Text>
          <Text style={styles.noAppointmentText}>
            {patientId 
              ? 'يمكنك حجز موعد جديد من خلال خدماتنا أدناه'
              : 'سجل الدخول لعرض مواعيدك وحجز مواعيد جديدة'}
          </Text>
          {patientId ? (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookAppointment}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.bookButtonText}>احجز موعد الآن</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.bookButtonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderReversed}>
          <Ionicons name="calendar-outline" size={30} color="#269237" />
          <Text style={styles.cardTitle}>موعدك القادم</Text>
        </View>

        <Text style={styles.cardSubtitle}>{upcomingAppointment.service}</Text>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.detailText}>📅 {upcomingAppointment.date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.detailText}>⏰ {upcomingAppointment.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.detailText}>📍 {upcomingAppointment.center}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>الحالة:</Text>
            <View style={[
              styles.statusBadge,
              upcomingAppointment.status === 'booked' ? styles.statusBooked : styles.statusCancelled
            ]}>
              <Text style={styles.statusText}>
                {upcomingAppointment.status === 'booked' ? 'مؤكد' : 'ملغى'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={handleManageAppointments}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.greenButtonText}>إدارة المواعيد</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBookAppointment}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>حجز موعد جديد</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ===== شريط علوي ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsTab")}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>مرحباً، {userName}</Text>

        <TouchableOpacity onPress={() => navigation.navigate("NotificationsTab")}>
          <Ionicons name="notifications-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ===== بطاقة التحكم السريع ===== */}
      <View style={styles.quickControlCard}>
        <Text style={styles.quickControlTitle}>التحكم السريع</Text>
        
        <View style={styles.quickControlGrid}>
          <TouchableOpacity 
            style={styles.quickControlButton}
            onPress={handleBookAppointment}
          >
            <View style={styles.quickControlIcon}>
              <Ionicons name="add-circle-outline" size={28} color="#269237" />
            </View>
            <Text style={styles.quickControlText}>حجز جديد</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickControlButton}
            onPress={handleManageAppointments}
          >
            <View style={styles.quickControlIcon}>
              <Ionicons name="calendar-outline" size={28} color="#269237" />
            </View>
            <Text style={styles.quickControlText}>مواعيدي</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickControlButton}
            onPress={handleCheckStatus}
          >
            <View style={styles.quickControlIcon}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#269237" />
            </View>
            <Text style={styles.quickControlText}>فحص الحالة</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#269237"]}
            tintColor="#269237"
          />
        }
      >

        {loading ? (
          <ActivityIndicator size="large" color="#269237" style={styles.loader} />
        ) : (
          <>
            {/* ===== البطاقة الأولى (موعدك القادم) ===== */}
            {renderUpcomingAppointment()}

            {/* ===== حالة الاتصال ===== */}
            {!backendConnected && (
              <View style={styles.connectionWarningCard}>
                <Ionicons name="warning-outline" size={24} color="#856404" />
                <View style={styles.connectionWarningTexts}>
                  <Text style={styles.connectionWarningTitle}>الوضع التجريبي</Text>
                  <Text style={styles.connectionWarningDescription}>
                    لا يمكن الاتصال بالخادم - يتم استخدام بيانات تجريبية
                  </Text>
                </View>
              </View>
            )}

            {/* ===== قسم خدماتنا ===== */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>خدماتنا</Text>

            {/* ===== بطاقة الهوية ===== */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeaderReversed}>
                <Ionicons name="id-card-outline" size={24} color="#269237" />
                <Text style={styles.serviceTitle}>إصدار الهوية الوطنية</Text>
              </View>

              <Text style={styles.serviceDesc}>
                يمكنك طلب إصدار هوية وطنية جديدة أو تجديد الهوية الحالية.
              </Text>

              <TouchableOpacity
                style={styles.greenButtonSmall}
                onPress={handleBookAppointment}
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.greenButtonText}>احجز موعد</Text>
              </TouchableOpacity>
            </View>

            {/* ===== بطاقة الجواز ===== */}
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeaderReversed}>
                <Ionicons name="airplane-outline" size={24} color="#269237" />
                <Text style={styles.serviceTitle}>إصدار جواز السفر</Text>
              </View>

              <Text style={styles.serviceDesc}>
                قم بطلب الحصول على جواز سفر جديد أو تجديد جوازك الحالي.
              </Text>

              <TouchableOpacity
                style={styles.greenButtonSmall}
                onPress={handleBookAppointment}
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.greenButtonText}>احجز موعد</Text>
              </TouchableOpacity>
            </View>

            {/* ===== إحصائيات ===== */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name="stats-chart-outline" size={24} color="#269237" />
                <Text style={styles.statsTitle}>إحصائيات</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                  <Text style={styles.statNumber}>
                    {upcomingCount}
                  </Text>
                  <Text style={styles.statLabel}>موعد قادم</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={24} color="#6c757d" />
                  <Text style={styles.statNumber}>
                    {totalAppointments}
                  </Text>
                  <Text style={styles.statLabel}>إجمالي المواعيد</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Ionicons name="close-circle" size={24} color="#dc3545" />
                  <Text style={styles.statNumber}>
                    {cancelledCount}
                  </Text>
                  <Text style={styles.statLabel}>ملغية</Text>
                </View>
              </View>
            </View>
            
            {/* ===== نصائح سريعة ===== */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={24} color="#269237" />
                <Text style={styles.tipsTitle}>نصائح سريعة</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                <Text style={styles.tipText}>
                  احضر قبل موعدك بـ 15 دقيقة لإكمال الإجراءات
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                <Text style={styles.tipText}>
                  أحضر جميع المستندات المطلوبة معك
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                <Text style={styles.tipText}>
                  يمكنك إلغاء الموعد قبل 24 ساعة من موعده
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#28a745" />
                <Text style={styles.tipText}>
                  تحقق من تنبيهات عدم الحضور لحسابك
                </Text>
              </View>
            </View>
            
            {/* ===== نظام التنبيهات الذكية ===== */}
            <View style={styles.systemInfoCard}>
              <View style={styles.systemInfoHeader}>
                <Ionicons name="analytics-outline" size={24} color="#269237" />
                <Text style={styles.systemInfoTitle}>نظام التنبيهات الذكية</Text>
              </View>
              
              <Text style={styles.systemInfoDescription}>
                نظامنا يحلل تاريخ مواعيدك للتنبؤ باحتمالية عدم الحضور، مما يساعد في:
              </Text>
              
              <View style={styles.systemInfoPoints}>
                <View style={styles.systemInfoPoint}>
                  <Ionicons name="checkmark-outline" size={16} color="#28a745" />
                  <Text style={styles.systemInfoPointText}>تقليل المواعيد الفارغة</Text>
                </View>
                <View style={styles.systemInfoPoint}>
                  <Ionicons name="checkmark-outline" size={16} color="#28a745" />
                  <Text style={styles.systemInfoPointText}>تحسين توزيع الخدمات</Text>
                </View>
                <View style={styles.systemInfoPoint}>
                  <Ionicons name="checkmark-outline" size={16} color="#28a745" />
                  <Text style={styles.systemInfoPointText}>تخصيص التنبيهات لكل مريض</Text>
                </View>
              </View>
            </View>
          </>
        )}

      </ScrollView>

      {/* ===== صورة اسفل ===== */}
      <Image
        source={require("./assets/logo.png")}
        style={styles.bottomImage}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F7F7F7" 
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700",
    color: '#333' 
  },

  loader: {
    marginTop: 50
  },

  /* === بطاقة التحكم السريع === */
  quickControlCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  quickControlTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },

  quickControlGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },

  quickControlButton: {
    alignItems: 'center',
  },

  quickControlIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#e8f5e9',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  quickControlText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },

  /* === بطاقة موعدك القادم === */
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  noAppointmentCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
  },

  noAppointmentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },

  noAppointmentText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },

  bookButton: {
    backgroundColor: "#269237",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },

  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  cardHeaderReversed: {
    flexDirection: "row-reverse", 
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 15,
  },

  cardTitle: { 
    fontSize: 22, 
    fontWeight: "700",
    color: '#333'
  },
  
  cardSubtitle: { 
    fontSize: 17, 
    fontWeight: "600",
    color: '#269237',
    marginBottom: 15,
  },

  appointmentDetails: {
    marginBottom: 20,
  },

  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },

  detailText: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },

  statusContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  statusLabel: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusBooked: {
    backgroundColor: '#d4edda',
  },

  statusCancelled: {
    backgroundColor: '#f8d7da',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
  },

  buttonContainer: {
    gap: 10,
  },

  greenButton: {
    backgroundColor: "#269237",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 10,
  },
  
  greenButtonSmall: {
    backgroundColor: "#269237",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
  },
  
  greenButtonText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16 
  },

  secondaryButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 10,
  },
  
  secondaryButtonText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16 
  },

  /* === تحذير الاتصال === */
  connectionWarningCard: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  connectionWarningTexts: {
    flex: 1,
    marginRight: 10,
  },

  connectionWarningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
    textAlign: 'right',
  },

  connectionWarningDescription: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'right',
    lineHeight: 20,
  },

  /* === خدماتنا === */
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#333',
    textAlign: 'right',
  },

  serviceCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  serviceHeaderReversed: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  serviceTitle: { 
    fontSize: 18, 
    fontWeight: "700",
    color: '#333'
  },
  
  serviceDesc: { 
    color: "#555", 
    marginVertical: 10,
    lineHeight: 22,
    fontSize: 15 
  },

  /* === إحصائيات === */
  statsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    elevation: 2,
  },

  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },

  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#dee2e6',
  },

  /* === نصائح === */
  tipsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },

  tipsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },

  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },

  tipItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 5,
  },

  tipText: {
    fontSize: 15,
    color: '#555',
    marginRight: 10,
    flex: 1,
    lineHeight: 22,
  },

  /* === معلومات النظام === */
  systemInfoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },

  systemInfoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },

  systemInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },

  systemInfoDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'right',
  },

  systemInfoPoints: {
    gap: 10,
  },

  systemInfoPoint: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },

  systemInfoPointText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },

  bottomImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 180,
    height: 180,
    opacity: 0.12,
    resizeMode: "contain",
  },
});