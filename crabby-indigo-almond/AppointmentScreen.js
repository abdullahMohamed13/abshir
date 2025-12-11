// AppointmentScreen.js - النسخة المحدثة
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getAvailableCenters, 
  getAvailableAppointments,
  bookAppointmentAPI,
  searchCentersByName,
  predictNoShow,
  formatArabicDate,
  formatArabicTime,
  getCityByCenterId 
} from "./api";

export default function AppointmentScreen({ navigation, route }) {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [patientId, setPatientId] = useState(null);

  // جلب ID المريض من AsyncStorage
  useEffect(() => {
    const loadPatientId = async () => {
      try {
        const storedPatientId = await AsyncStorage.getItem('patientId');
        setPatientId(storedPatientId || 'PAT001');
      } catch (error) {
        console.error('Error loading patient ID:', error);
        setPatientId('PAT001'); // قيمة افتراضية
      }
    };
    
    loadPatientId();
  }, []);

  // جلب المراكز عند فتح الشاشة
  useEffect(() => {
    loadCenters();
  }, []);

  // جلب المراكز المتاحة
  const loadCenters = async () => {
    setLoadingCenters(true);
    try {
      const centersList = await getAvailableCenters();
      setCenters(centersList);
    } catch (error) {
      console.error('Error loading centers:', error);
      Alert.alert("خطأ", "فشل في تحميل المراكز");
    } finally {
      setLoadingCenters(false);
    }
  };

  // البحث عن مركز
  const handleSearch = async () => {
    if (!searchText.trim()) {
      loadCenters();
      return;
    }
    
    setIsSearching(true);
    try {
      const searchResults = await searchCentersByName(searchText);
      setCenters(searchResults);
    } catch (error) {
      Alert.alert("خطأ", "فشل في البحث عن المراكز");
    } finally {
      setIsSearching(false);
    }
  };

  // اختيار مركز وجلب المواعيد المتاحة
  const selectCenter = async (center) => {
    setSelectedCenter(center);
    setLoadingSlots(true);
    
    try {
      const appointmentsData = await getAvailableAppointments(center.center_id);
      setSlots(appointmentsData.available_slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert("خطأ", "فشل في جلب المواعيد المتاحة");
    } finally {
      setLoadingSlots(false);
    }
  };

  // حجز موعد
  const handleBookAppointment = async (slot) => {
    if (!patientId) {
      Alert.alert("خطأ", "يجب تسجيل الدخول أولاً");
      navigation.navigate("Login");
      return;
    }

    try {
      // أولاً: التنبؤ بعدم الحضور
      const prediction = await predictNoShow(patientId, slot.appointment_id, slot.center_id);
      
      // ثانياً: حجز الموعد
      const appointmentData = {
        patient_id: patientId,
        appointment_id: slot.appointment_id,
        patient_name: 'محمد أحمد', // TODO: من بيانات المستخدم
        phone_number: '+966500000000'
      };
      
      const bookingResult = await bookAppointmentAPI(appointmentData);
      
      if (bookingResult.status === 'success') {
        // إذا كانت احتمالية عدم الحضور عالية، انتقل لشاشة التنبيهات
        if (prediction.risk_level === 'عالي' && prediction.recommendation === 'إلغاء') {
          navigation.navigate("Notifications", {
            appointmentId: slot.appointment_id,
            prediction: prediction,
            slotInfo: {
              date: slot.date_arabic,
              time: slot.time_arabic,
              center: slot.center_id
            },
            bookingResult: bookingResult
          });
        } else {
          // انتقل لشاشة التأكيد
          navigation.navigate("Confirm", {
            appointmentId: slot.appointment_id,
            slotInfo: {
              date: slot.date_arabic,
              time: slot.time_arabic,
              center: getCityByCenterId(slot.center_id),
              waitTime: slot.estimated_wait_time
            }
          });
        }
      } else {
        Alert.alert("خطأ", "فشل في حجز الموعد");
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert("خطأ", "فشل في إكمال عملية الحجز");
    }
  };

  // تحديث البيانات
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCenters();
    if (selectedCenter) {
      await selectCenter(selectedCenter);
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن مركز..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#269237"]}
          />
        }
      >
        <Text style={styles.title}>اختر المركز</Text>

        {loadingCenters ? (
          <ActivityIndicator size="large" color="#269237" style={styles.loader} />
        ) : (
          <>
            {/* قائمة المراكز */}
            {centers.length > 0 ? (
              centers.map((center) => (
                <TouchableOpacity
                  key={center.center_id}
                  style={[
                    styles.centerCard,
                    selectedCenter?.center_id === center.center_id && styles.selectedCenterCard
                  ]}
                  onPress={() => selectCenter(center)}
                >
                  <Text style={styles.centerName}>{center.center_name || center.name}</Text>
                  <Text style={styles.centerCity}>المدينة: {center.city}</Text>
                  <Text style={styles.centerAddress}>العنوان: {center.address}</Text>
                  <Text style={styles.centerId}>رقم المركز: {center.center_id}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noCentersText}>لا توجد مراكز متاحة</Text>
            )}
          </>
        )}

        {/* المواعيد المتاحة للمركز المحدد */}
        {selectedCenter && (
          <>
            <Text style={styles.subtitle}>
              المواعيد المتاحة في {selectedCenter.center_name || selectedCenter.name}
            </Text>
            
            {loadingSlots ? (
              <ActivityIndicator size="large" color="#269237" style={styles.loader} />
            ) : slots.length > 0 ? (
              slots.map((slot, index) => (
                <View key={slot.appointment_id || index} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.serviceType}>{slot.service_type}</Text>
                    {slot.is_peak_hour && (
                      <View style={styles.peakHourBadge}>
                        <Text style={styles.peakHourText}>⏰ وقت ذروة</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.slotDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>📅</Text>
                      <Text style={styles.info}>{slot.date_arabic || formatArabicDate(slot.datetime)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>⏰</Text>
                      <Text style={styles.info}>{slot.time_arabic || formatArabicTime(slot.datetime)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>⏱️</Text>
                      <Text style={styles.info}>وقت الانتظار المتوقع: {slot.estimated_wait_time} دقيقة</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleBookAppointment(slot)}
                  >
                    <Text style={styles.buttonText}>حجز الموعد</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noSlotsText}>لا توجد مواعيد متاحة حالياً في هذا المركز</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: "#fff", 
    direction: "rtl" 
  },
  searchContainer: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  searchInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#f9f9f9'
  },
  searchButton: { 
    backgroundColor: '#269237', 
    width: 50,
    height: 50,
    borderRadius: 8, 
    marginRight: 10, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: { 
    color: '#fff', 
    fontSize: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
    color: '#333'
  },
  loader: {
    marginVertical: 30
  },
  centerCard: { 
    padding: 15, 
    borderRadius: 10, 
    backgroundColor: '#f8f9fa', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  selectedCenterCard: { 
    borderColor: '#269237', 
    backgroundColor: '#e8f5e9',
    borderWidth: 2 
  },
  centerName: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 5, 
    textAlign: 'right',
    color: '#333'
  },
  centerCity: { 
    fontSize: 14, 
    color: '#555', 
    textAlign: 'right',
    marginBottom: 2 
  },
  centerAddress: { 
    fontSize: 12, 
    color: '#777', 
    textAlign: 'right',
    marginBottom: 2 
  },
  centerId: { 
    fontSize: 12, 
    color: '#999', 
    textAlign: 'right' 
  },
  noCentersText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 25, 
    marginBottom: 15, 
    textAlign: "right",
    color: '#333'
  },
  card: { 
    padding: 20, 
    borderRadius: 15, 
    backgroundColor: "#fff", 
    marginBottom: 15, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#269237'
  },
  peakHourBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7'
  },
  peakHourText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500'
  },
  slotDetails: {
    marginBottom: 15
  },
  detailRow: { 
    flexDirection: "row-reverse", 
    alignItems: "center", 
    marginBottom: 8 
  },
  icon: { 
    fontSize: 18, 
    marginLeft: 10 
  },
  info: { 
    fontSize: 16,
    color: '#555'
  },
  noSlotsText: { 
    textAlign: 'center', 
    fontSize: 16, 
    color: '#999', 
    marginTop: 20 
  },
  button: { 
    backgroundColor: "#269237", 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center'
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});