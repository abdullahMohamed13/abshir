// SignupScreen.js - شاشة إنشاء حساب جديد مبسطة
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nationalId: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    age: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // التحقق من رقم الهوية
    if (!formData.nationalId.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال رقم الهوية الوطنية");
      return false;
    }
    
    if (formData.nationalId.length !== 10) {
      Alert.alert("خطأ", "رقم الهوية الوطنية يجب أن يكون 10 أرقام");
      return false;
    }

    if (!/^\d+$/.test(formData.nationalId)) {
      Alert.alert("خطأ", "رقم الهوية الوطنية يجب أن يحتوي على أرقام فقط");
      return false;
    }

    // التحقق من الاسم الكامل
    if (!formData.fullName.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال الاسم الكامل");
      return false;
    }

    if (formData.fullName.length < 6) {
      Alert.alert("خطأ", "الاسم الكامل يجب أن يكون 6 أحرف على الأقل");
      return false;
    }

    // التحقق من العمر
    if (!formData.age.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال العمر");
      return false;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 18) {
      Alert.alert("خطأ", "يجب أن يكون عمرك 18 سنة على الأقل");
      return false;
    }

    if (ageNum > 120) {
      Alert.alert("خطأ", "الرجاء إدخال عمر صحيح");
      return false;
    }

    // التحقق من كلمة المرور
    if (!formData.password.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال كلمة المرور");
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }

    // التحقق من تأكيد كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("خطأ", "كلمتا المرور غير متطابقتين");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));

      // إنشاء patientId فريد بناءً على رقم الهوية والعمر
      const patientId = `PAT${formData.nationalId.slice(-6)}_${formData.age}`;
      
      // حفظ بيانات المستخدم في AsyncStorage
      await AsyncStorage.setItem('userToken', 'dummy_token_' + Date.now());
      await AsyncStorage.setItem('userNationalId', formData.nationalId);
      await AsyncStorage.setItem('userName', formData.fullName);
      await AsyncStorage.setItem('patientId', patientId);
      await AsyncStorage.setItem('userAge', formData.age);
      await AsyncStorage.setItem('hasUpcomingAppointment', 'false');
      await AsyncStorage.setItem('userRegisteredAt', new Date().toISOString());

      // حفظ سجل أولي للمريض في history (no_show = 0 افتراضياً)
      const patientHistory = {
        patient_id: patientId,
        appointments_count: 0,
        no_show_count: 0,
        last_appointment: null,
        registration_date: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`patient_${patientId}_history`, JSON.stringify(patientHistory));

      // نجاح التسجيل
      Alert.alert(
        "🎉 تهانينا!",
        `تم إنشاء حسابك بنجاح ${formData.fullName}!\n\n` +
        `📋 رقم حسابك: ${patientId}\n` +
        `👤 الاسم: ${formData.fullName}\n` +
        `🆔 الهوية: ${formData.nationalId}\n` +
        `🎂 العمر: ${formData.age} سنة\n\n` +
        `سيتم تحويلك للصفحة الرئيسية الآن.`,
        [
          {
            text: "متابعة",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert("❌ خطأ", "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  const handleQuickSignup = () => {
    // تسجيل سريع للاختبار
    setFormData({
      nationalId: "1234567890",
      fullName: "أحمد محمد علي",
      password: "123456",
      confirmPassword: "123456",
      age: "25"
    });
    
    setTimeout(() => {
      handleSignup();
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* الهيدر مع زر العودة */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إنشاء حساب جديد</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={require("./assets/logo.png")} 
            style={styles.logo} 
          />
        </View>

        <Text style={styles.title}>انضم إلينا الآن</Text>
        <Text style={styles.subtitle}>
          أنشئ حسابك في دقائق واستفد من خدمات حجز المواعيد الذكية
        </Text>

        {/* نموذج التسجيل المبسط */}
        <View style={styles.formContainer}>
          {/* رقم الهوية الوطنية */}
          <Text style={styles.label}>رقم الهوية الوطنية *</Text>
          <View style={styles.inputContainer}>
            <Ionicons 
              name="id-card-outline" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="1234567890"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
              value={formData.nationalId}
              onChangeText={(value) => handleInputChange('nationalId', value)}
              editable={!loading}
            />
          </View>

          {/* الاسم الكامل */}
          <Text style={styles.label}>الاسم الكامل *</Text>
          <View style={styles.inputContainer}>
            <Ionicons 
              name="person-outline" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="أحمد محمد علي"
              placeholderTextColor="#999"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              editable={!loading}
            />
          </View>

          {/* العمر */}
          <Text style={styles.label}>العمر *</Text>
          <View style={styles.inputContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={3}
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              editable={!loading}
            />
            <Text style={styles.ageUnit}>سنة</Text>
          </View>

          {/* كلمة المرور */}
          <Text style={styles.label}>كلمة المرور *</Text>
          <View style={styles.inputContainer}>
            <Ionicons 
              name="lock-closed-outline" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={loading}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* تأكيد كلمة المرور */}
          <Text style={styles.label}>تأكيد كلمة المرور *</Text>
          <View style={styles.inputContainer}>
            <Ionicons 
              name="lock-closed-outline" 
              size={22} 
              color="#666" 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
              disabled={loading}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* شروط الاستخدام */}
          <View style={styles.termsContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#269237" />
            <Text style={styles.termsText}>
              بالضغط على "إنشاء حساب" فإنك توافق على 
              <Text style={styles.termsLink} onPress={() => Alert.alert("شروط الاستخدام", "سيتم إضافة الشروط هنا")}> شروط الاستخدام </Text>
              و 
              <Text style={styles.termsLink} onPress={() => Alert.alert("سياسة الخصوصية", "سيتم إضافة سياسة الخصوصية هنا")}> سياسة الخصوصية</Text>
            </Text>
          </View>

          {/* زر إنشاء الحساب */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={22} color="#fff" />
                <Text style={styles.buttonText}>إنشاء حساب</Text>
              </>
            )}
          </TouchableOpacity>

          {/* تسجيل سريع للاختبار (فقط في وضع التطوير) */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.quickSignupButton}
              onPress={handleQuickSignup}
              disabled={loading}
            >
              <Text style={styles.quickSignupText}>تسجيل سريع للاختبار</Text>
            </TouchableOpacity>
          )}

          {/* رابط تسجيل الدخول */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>لديك حساب بالفعل؟ </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.loginLink}>سجل دخولك</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* فوائد التسجيل */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>✨ فوائد إنشاء حساب</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.benefitText}>حجز مواعيد بسرعة وسهولة</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.benefitText}>تتبع جميع مواعيدك في مكان واحد</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.benefitText}>استقبال تنبيهات ذكية قبل المواعيد</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.benefitText}>تحليل أداء حضورك للمواعيد</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#28a745" />
            <Text style={styles.benefitText}>إلغاء أو إعادة جدولة المواعيد بسهولة</Text>
          </View>
        </View>

        {/* معلومات النظام */}
        <View style={styles.systemInfo}>
          <Text style={styles.systemInfoTitle}>📱 معلومات النظام</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#28a745" />
            <Text style={styles.infoText}>نظام آمن ومعتمد</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#17a2b8" />
            <Text style={styles.infoText}>خدمة 24/7</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait-outline" size={16} color="#6c757d" />
            <Text style={styles.infoText}>دعم جميع الأجهزة</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  label: {
    width: "100%",
    textAlign: "right",
    color: "#333",
    fontSize: 15,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: "#d6d6d6",
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: 'right',
    color: '#333',
  },
  ageUnit: {
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: 'right',
    color: '#333',
    paddingLeft: 12,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  termsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
    textAlign: 'right',
  },
  termsLink: {
    color: "#269237",
    fontWeight: '600',
  },
  button: {
    backgroundColor: "#269237",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  quickSignupButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  quickSignupText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLinkContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginLinkText: {
    fontSize: 15,
    color: '#666',
  },
  loginLink: {
    color: "#269237",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: 'underline',
  },
  benefitsCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
  },
  benefitItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  systemInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  systemInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  infoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
    flex: 1,
    textAlign: 'right',
  },
});