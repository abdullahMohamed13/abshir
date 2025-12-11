// NotificationsScreen.js - النسخة الكاملة المحدثة
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { predictNoShow, cancelAppointmentAPI, getPatientAppointments, formatArabicDate, formatArabicTime } from "./api";

export default function NotificationsScreen({ route, navigation }) {
  const [prediction, setPrediction] = useState(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const storedPatientId = await AsyncStorage.getItem('patientId');
        setPatientId(storedPatientId);
        
        if (storedPatientId) {
          await loadPatientAppointments(storedPatientId);
        }
        
        if (route.params?.prediction) {
          setPrediction(route.params.prediction);
          setShowPredictionModal(true);
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPatientData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadPatientData();
    });

    return unsubscribe;
  }, [navigation, route.params]);

  const loadPatientAppointments = async (patientId) => {
    try {
      setLoading(true);
      const appointmentsData = await getPatientAppointments(patientId);
      setAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (patientId) {
      await loadPatientAppointments(patientId);
    }
    setRefreshing(false);
  };

  const handleConfirmAppointment = () => {
    Alert.alert(
      "تم التأكيد", 
      "تم تأكيد حضورك للموعد بنجاح. سيتم إرسال تذكير لك قبل الموعد بـ 24 ساعة.",
      [
        { 
          text: "موافق", 
          onPress: () => {
            setShowPredictionModal(false);
            navigation.navigate("Home");
          }
        }
      ]
    );
  };

  const handleCancelAppointment = async () => {
    if (!patientId || !prediction?.appointment_id) {
      Alert.alert("خطأ", "لا يمكن إتمام عملية الإلغاء");
      return;
    }

    Alert.alert(
      "إلغاء الموعد",
      "هل أنت متأكد من إلغاء الموعد؟ سيتم تحريره لمستخدم آخر.",
      [
        { text: "تراجع", style: "cancel" },
        { 
          text: "تأكيد الإلغاء", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await cancelAppointmentAPI(prediction.appointment_id, patientId);
              
              if (result.status === 'success') {
                // تحديث AsyncStorage
                await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
                
                // تحديث قائمة المواعيد
                if (patientId) {
                  await loadPatientAppointments(patientId);
                }
                
                Alert.alert(
                  "✅ تم الإلغاء", 
                  "تم إلغاء الموعد بنجاح. سيتم تحريره لمستخدم آخر.",
                  [
                    { 
                      text: "موافق", 
                      onPress: () => {
                        setShowPredictionModal(false);
                        setPrediction(null);
                        navigation.navigate("Home");
                      }
                    }
                  ]
                );
              } else {
                Alert.alert("خطأ", "فشل في إلغاء الموعد");
              }
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert("خطأ", "تعذر إلغاء الموعد");
            }
          }
        }
      ]
    );
  };

  const getRiskLevelColor = (riskLevel) => {
    switch(riskLevel) {
      case 'عالي': return '#dc3545';
      case 'متوسط': return '#ffc107';
      case 'منخفض': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch(recommendation) {
      case 'إلغاء': return 'close-circle';
      case 'تأكيد': return 'checkmark-circle';
      case 'متابعة': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const renderPredictionCard = () => {
    if (!prediction) return null;

    return (
      <View style={[styles.predictionCard, { borderColor: getRiskLevelColor(prediction.risk_level) }]}>
        <View style={styles.predictionHeader}>
          <Ionicons 
            name={getRecommendationIcon(prediction.recommendation)} 
            size={28} 
            color={getRiskLevelColor(prediction.risk_level)} 
          />
          <Text style={styles.predictionTitle}>تنبيه احتمالية عدم الحضور</Text>
        </View>
        
        <View style={styles.predictionDetails}>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>مستوى الخطورة:</Text>
            <View style={[styles.riskBadge, 
              { backgroundColor: getRiskLevelColor(prediction.risk_level) + '20' }]}>
              <Text style={[styles.riskText, 
                { color: getRiskLevelColor(prediction.risk_level) }]}>
                {prediction.risk_level}
              </Text>
            </View>
          </View>
          
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>الاحتمالية:</Text>
            <Text style={[styles.predictionValue, 
              { color: getRiskLevelColor(prediction.risk_level) }]}>
              {(prediction.no_show_probability * 100).toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>التوصية:</Text>
            <Text style={[styles.predictionValue, 
              { color: getRiskLevelColor(prediction.risk_level) }]}>
              {prediction.recommendation}
            </Text>
          </View>
        </View>
        
        <Text style={styles.predictionDescription}>
          {prediction.message}
        </Text>
        
        <View style={styles.actionsContainer}>
          {prediction.recommendation === 'إلغاء' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirmAppointment}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>تأكيد الحضور</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelAppointment}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>إلغاء الموعد</Text>
              </TouchableOpacity>
            </>
          ) : prediction.recommendation === 'تأكيد' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleConfirmAppointment}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>تأكيد الحضور</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.monitorButton]}
              onPress={() => setShowPredictionModal(true)}
            >
              <Ionicons name="eye-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>متابعة</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderAppointmentCard = (appointment, index) => {
    const statusColors = {
      'booked': '#28a745',
      'available': '#6c757d',
      'cancelled': '#dc3545'
    };

    const statusText = {
      'booked': 'مؤكد',
      'available': 'متاح',
      'cancelled': 'ملغى'
    };

    const isUpcoming = appointment.status === 'booked' && new Date(appointment.datetime) > new Date();

    return (
      <TouchableOpacity 
        key={appointment.appointment_id || index} 
        style={[
          styles.appointmentCard,
          isUpcoming && styles.upcomingAppointmentCard
        ]}
        onPress={() => {
          // يمكن إضافة تفاصيل إضافية عند الضغط
        }}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.serviceContainer}>
            <Ionicons 
              name={appointment.service_type === 'اصدار جواز السفر' ? 'airplane-outline' : 'id-card-outline'} 
              size={20} 
              color="#269237" 
            />
            <Text style={styles.appointmentService}>
              {appointment.service_type || 'اصدار الهوية'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[appointment.status] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[appointment.status] }]}>
              {statusText[appointment.status] || appointment.status}
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
        
        {isUpcoming && (
          <View style={styles.upcomingBadge}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.upcomingText}>قادم</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* شريط العنوان */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المواعيد والإشعارات</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#269237"]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#269237" style={styles.loader} />
        ) : (
          <>
            {/* التنبيهات */}
            <Text style={styles.mainTitle}>التنبيهات الذكية</Text>
            
            {prediction ? (
              renderPredictionCard()
            ) : (
              <View style={styles.noAlertsCard}>
                <Ionicons name="checkmark-circle-outline" size={50} color="#28a745" />
                <Text style={styles.noAlertsTitle}>لا توجد تنبيهات</Text>
                <Text style={styles.noAlertsText}>
                  جميع مواعيدك مؤكدة ولا توجد تنبيهات بخصوص عدم الحضور.
                </Text>
              </View>
            )}

            {/* جميع المواعيد */}
            <View style={styles.allAppointmentsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>جميع مواعيدك</Text>
                <Text style={styles.appointmentsCount}>
                  ({appointments.length} موعد)
                </Text>
              </View>
              
              {!patientId ? (
                <View style={styles.loginPrompt}>
                  <Ionicons name="log-in-outline" size={40} color="#6c757d" />
                  <Text style={styles.loginPromptText}>يجب تسجيل الدخول لعرض المواعيد</Text>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                  </TouchableOpacity>
                </View>
              ) : appointments.length === 0 ? (
                <View style={styles.noAppointmentsContainer}>
                  <Ionicons name="calendar-outline" size={50} color="#6c757d" />
                  <Text style={styles.noAppointmentsText}>لا توجد مواعيد حالياً</Text>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => navigation.navigate("Appointment")}
                  >
                    <Text style={styles.bookNowButtonText}>احجز موعد الآن</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.appointmentsList}>
                  {appointments.map((appointment, index) => 
                    renderAppointmentCard(appointment, index)
                  )}
                </View>
              )}
            </View>

            {/* قسم معلومات النظام */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>كيف يعمل النظام؟</Text>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="analytics-outline" size={22} color="#269237" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoSubtitle}>تحليل الذكاء الاصطناعي</Text>
                  <Text style={styles.infoText}>
                    يحلل النظام تاريخك السابق للتنبؤ باحتمالية حضورك
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="notifications-outline" size={22} color="#269237" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoSubtitle}>تنبيهات ذكية</Text>
                  <Text style={styles.infoText}>
                    تحصل على تنبيهات عند وجود احتمالية عالية لعدم الحضور
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="refresh-outline" size={22} color="#269237" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoSubtitle}>تحسين الخدمة</Text>
                  <Text style={styles.infoText}>
                    يساعد في تقليل المواعيد الفارغة وتحسين توزيع الخدمات
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal للتنبؤ */}
      <Modal
        visible={showPredictionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPredictionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تنبيه ذكي</Text>
              <TouchableOpacity onPress={() => setShowPredictionModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {prediction && (
              <>
                <View style={styles.modalPrediction}>
                  <Ionicons 
                    name={getRecommendationIcon(prediction.recommendation)} 
                    size={60} 
                    color={getRiskLevelColor(prediction.risk_level)} 
                  />
                  <Text style={styles.modalMessage}>
                    {prediction.message}
                  </Text>
                  <View style={styles.modalStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>الاحتمالية</Text>
                      <Text style={[styles.statValue, { color: getRiskLevelColor(prediction.risk_level) }]}>
                        {(prediction.no_show_probability * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>مستوى الخطر</Text>
                      <Text style={[styles.statValue, { color: getRiskLevelColor(prediction.risk_level) }]}>
                        {prediction.risk_level}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.modalDescription}>
                  يساعد هذا النظام في تقليل المواعيد الفارغة وتحسين توزيع الخدمات. يرجى اختيار الإجراء المناسب:
                </Text>
                
                <View style={styles.modalActions}>
                  {prediction.recommendation === 'إلغاء' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalCancelButton]}
                      onPress={() => {
                        setShowPredictionModal(false);
                        handleCancelAppointment();
                      }}
                    >
                      <Ionicons name="close-circle" size={22} color="#fff" />
                      <Text style={styles.modalButtonText}>إلغاء الموعد</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={() => {
                      setShowPredictionModal(false);
                      handleConfirmAppointment();
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.modalButtonText}>تأكيد الحضور</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalLaterButton]}
                    onPress={() => setShowPredictionModal(false)}
                  >
                    <Ionicons name="time-outline" size={22} color="#6c757d" />
                    <Text style={[styles.modalButtonText, { color: '#6c757d' }]}>تأجيل القرار</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F8F8" 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginLeft: 10, 
    flex: 1, 
    textAlign: 'center' 
  },
  content: { 
    padding: 20, 
    paddingBottom: 40 
  },
  loader: {
    marginTop: 50,
  },
  mainTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 20, 
    textAlign: "right", 
    color: "#333" 
  },
  
  // Prediction Card
  predictionCard: { 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 20, 
    elevation: 3,
    borderWidth: 2
  },
  predictionHeader: { 
    flexDirection: "row-reverse", 
    alignItems: "center", 
    marginBottom: 15 
  },
  predictionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginRight: 10, 
    color: "#333" 
  },
  predictionDetails: { 
    marginBottom: 15 
  },
  predictionRow: { 
    flexDirection: "row-reverse", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12 
  },
  predictionLabel: { 
    fontSize: 16, 
    color: "#666" 
  },
  predictionValue: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  riskBadge: { 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  riskText: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
  predictionDescription: { 
    fontSize: 14, 
    color: "#666", 
    lineHeight: 22, 
    marginBottom: 20, 
    textAlign: "right" 
  },
  
  // Actions
  actionsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 10 
  },
  actionButton: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 12, 
    borderRadius: 10, 
    gap: 8 
  },
  confirmButton: { 
    backgroundColor: "#28a745" 
  },
  cancelButton: { 
    backgroundColor: "#dc3545" 
  },
  monitorButton: { 
    backgroundColor: "#ffc107" 
  },
  actionButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
  },
  
  // No Alerts
  noAlertsCard: { 
    backgroundColor: "#fff", 
    borderRadius: 15, 
    padding: 30, 
    alignItems: "center", 
    marginBottom: 20 
  },
  noAlertsTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginTop: 15, 
    marginBottom: 10, 
    color: "#333" 
  },
  noAlertsText: { 
    fontSize: 16, 
    color: "#666", 
    textAlign: "center", 
    lineHeight: 24 
  },
  
  // All Appointments
  allAppointmentsSection: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'right',
  },
  appointmentsCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loginPrompt: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 15,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#269237',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noAppointmentsContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  bookNowButton: {
    backgroundColor: '#269237',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 1,
    position: 'relative',
  },
  upcomingAppointmentCard: {
    borderWidth: 1,
    borderColor: '#269237',
  },
  appointmentHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginTop: 5,
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
  },
  upcomingBadge: {
    position: 'absolute',
    top: -8,
    left: 15,
    backgroundColor: '#269237',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  upcomingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Info Card
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginTop: 25,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "right"
  },
  infoItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right',
  },
  
  // Modal
  modalContainer: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContent: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 25, 
    width: "90%", 
    maxWidth: 400,
    maxHeight: "80%" 
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333" 
  },
  modalPrediction: { 
    alignItems: "center", 
    marginBottom: 20 
  },
  modalMessage: { 
    fontSize: 18, 
    textAlign: "center", 
    marginVertical: 15, 
    color: "#555",
    lineHeight: 26 
  },
  modalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10
  },
  statItem: {
    alignItems: "center"
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold"
  },
  modalDescription: { 
    fontSize: 14, 
    color: "#666", 
    textAlign: "center", 
    marginBottom: 25, 
    lineHeight: 22 
  },
  modalActions: { 
    gap: 10 
  },
  modalButton: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15, 
    borderRadius: 10, 
    gap: 10
  },
  modalConfirmButton: { 
    backgroundColor: "#28a745" 
  },
  modalCancelButton: { 
    backgroundColor: "#dc3545" 
  },
  modalLaterButton: { 
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6"
  },
  modalButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  }
});