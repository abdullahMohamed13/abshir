// ConfirmScreen.js - النسخة الكاملة المحدثة
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmScreen({ route, navigation }) {
  const { appointmentId, slotInfo } = route.params || {};
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // لا نذهب تلقائياً للرئيسية، نترك المستخدم يختار
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  const handleViewAppointments = () => {
    navigation.navigate("NotificationsTab", {
      screen: 'Notifications'
    });
  };

  const handleBookAnother = () => {
    navigation.navigate("Appointment");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name="checkmark-circle" 
          size={150} 
          color="#269237" 
          style={styles.checkIcon} 
        />
        
        <Text style={styles.mainText}>✅ تم حجز الموعد بنجاح</Text>
        
        {slotInfo && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>تفاصيل الموعد:</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="id-card-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{slotInfo.service || 'اصدار الهوية'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{slotInfo.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{slotInfo.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{slotInfo.center}</Text>
            </View>
            
            {slotInfo.waitTime && (
              <View style={styles.detailRow}>
                <Ionicons name="timer-outline" size={20} color="#555" />
                <Text style={styles.detailText}>وقت الانتظار المتوقع: {slotInfo.waitTime} دقيقة</Text>
              </View>
            )}
            
            {appointmentId && (
              <View style={styles.appointmentIdContainer}>
                <Text style={styles.appointmentIdLabel}>رقم الحجز:</Text>
                <Text style={styles.appointmentId}>{appointmentId}</Text>
              </View>
            )}
          </View>
        )}
        
        <Text style={styles.helpText}>
          تم إرسال تأكيد الحجز إلى بريدك الإلكتروني ورقم الهاتف المسجل
        </Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>نصائح مهمة:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.tipText}>احضر قبل الموعد بـ 15 دقيقة على الأقل</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.tipText}>أحضر الهوية الوطنية الأصلية معك</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.tipText}>يمكنك إلغاء الموعد قبل 24 ساعة من موعده</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>العودة للرئيسية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewAppointments}>
            <Ionicons name="calendar-outline" size={22} color="#fff" />
            <Text style={styles.secondaryButtonText}>عرض المواعيد</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={handleBookAnother}>
            <Ionicons name="add-circle-outline" size={22} color="#269237" />
            <Text style={styles.tertiaryButtonText}>حجز موعد آخر</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footerText}>
          شكراً لاستخدامك تطبيق تراص لتسهيل خدمات الأحوال المدنية
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 25,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    marginBottom: 25,
  },
  mainText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#269237",
    marginBottom: 25,
    textAlign: "center",
  },
  detailsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "right",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginRight: 10,
    textAlign: "right",
    flex: 1,
  },
  appointmentIdContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    alignItems: "center",
  },
  appointmentIdLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  appointmentId: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#dee2e6",
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "right",
  },
  tipItem: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: "#555",
    marginRight: 10,
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 12,
    marginBottom: 25,
  },
  primaryButton: {
    backgroundColor: "#269237",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  tertiaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#269237",
  },
  tertiaryButtonText: {
    color: "#269237",
    fontSize: 18,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    fontStyle: 'italic',
  },
});