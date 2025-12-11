// LoginScreen.js - النسخة المحدثة
import React, { useState, useEffect } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, getApiStatus } from "./api";

export default function LoginScreen({ navigation, route }) {
  const [showPassword, setShowPassword] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    checkBackendConnection();

    // التحقق إذا كان هناك جلسة نشطة
    checkExistingSession();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const status = await getApiStatus();
      setBackendConnected(status.connected);
      setApiStatus(status);
    } catch (error) {
      console.error("Error checking backend connection:", error);
      setBackendConnected(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (userToken) {
        // إذا كان هناك جلسة نشطة، انتقل للرئيسية
        navigation.replace("Home");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const validateInputs = () => {
    if (!nationalId.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال رقم الهوية الوطنية");
      return false;
    }

    if (nationalId.length !== 10) {
      Alert.alert("خطأ", "رقم الهوية الوطنية يجب أن يكون 10 أرقام");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال كلمة المرور");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const result = await loginUser(nationalId, password);

      if (result.success) {
        // نجاح تسجيل الدخول
        Alert.alert(
          "تم تسجيل الدخول",
          `مرحباً ${result.user.name}!\nتم تسجيل دخولك بنجاح.`,
          [
            {
              text: "متابعة",
              onPress: () => {
                navigation.replace("Home");
              }
            }
          ]
        );
      } else {
        Alert.alert("خطأ", result.message || "فشل تسجيل الدخول");
      }
    } catch (error) {
      console.error("Login error:", error);

      // في حالة فشل الاتصال مع Backend، استخدم بيانات وهمية
      if (!backendConnected) {
        Alert.alert(
          "تنبيه",
          "لا يمكن الاتصال بالخادم. سيتم استخدام بيانات تجريبية.",
          [
            {
              text: "متابعة",
              onPress: async () => {
                try {
                  // إنشاء patientId فريد بناءً على رقم الهوية
                  const patientId = `PAT${nationalId.slice(-6)}`;

                  await AsyncStorage.setItem("userToken", "dummy_token_123");
                  await AsyncStorage.setItem("userNationalId", nationalId);
                  await AsyncStorage.setItem("userName", "محمد أحمد");
                  await AsyncStorage.setItem("patientId", patientId);
                  await AsyncStorage.setItem("hasUpcomingAppointment", "false");

                  navigation.replace("Home");
                } catch (storageError) {
                  console.error("Storage error:", storageError);
                  Alert.alert("خطأ", "تعذر حفظ بيانات الجلسة");
                }
              }
            },
            {
              text: "إلغاء",
              style: "cancel"
            }
          ]
        );
      } else {
        Alert.alert("خطأ", error.message || "حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    // تسجيل دخول سريع للاختبار
    setNationalId("1234567890");
    setPassword("123456");

    setTimeout(() => {
      handleLogin();
    }, 500);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "نسيت كلمة المرور",
      "للحصول على كلمة مرور جديدة، يرجى:\n\n1. الذهاب إلى أقرب مركز للأحوال المدنية\n2. تقديم طلب استعادة كلمة المرور\n3. إحضار الهوية الوطنية الأصلية",
      [{ text: "موافق" }]
    );
  };

  const handleRegister = () => {
    Alert.alert(
      "التسجيل الجديد",
      "لتسجيل حساب جديد:\n\n1. قم بزيارة أقرب مركز للأحوال المدنية\n2. قدم طلب تسجيل جديد\n3. سيتم إصدار بيانات الدخول لك خلال 24 ساعة عمل",
      [{ text: "موافق" }]
    );
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
        <View style={styles.logoContainer}>
          <Image source={require("./assets/logo.png")} style={styles.logo} />
        </View>

        <Text style={styles.title}>مرحباً بك في تَراص</Text>
        <Text style={styles.subtitle}>
          نظام حجز مواعيد الأحوال المدنية الذكي
        </Text>

        {/* حالة الاتصال */}
        {!backendConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="warning-outline" size={20} color="#856404" />
            <Text style={styles.connectionWarningText}>
              ⚠️ غير متصل بالخادم - وضع تجريبي
            </Text>
          </View>
        )}

        {/* نموذج تسجيل الدخول */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>الهوية الوطنية</Text>
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
              value={nationalId}
              onChangeText={setNationalId}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>كلمة المرور</Text>
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
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              autoCapitalize="none"
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

          {/* نسيت كلمة المرور */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          {/* زر تسجيل الدخول */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={22} color="#fff" />
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              </>
            )}
          </TouchableOpacity>

          {/* تسجيل سريع للاختبار (فقط في وضع التطوير) */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={handleQuickLogin}
              disabled={loading}
            >
              <Text style={styles.quickLoginText}>تسجيل سريع للاختبار</Text>
            </TouchableOpacity>
          )}

          {/* خط فاصل */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* تسجيل جديد */}
          <Text style={styles.registerLinkText}>ليس لديك حساب؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.registerLink}>إنشاء حساب جديد</Text>
          </TouchableOpacity>

          {/* معلومات حول النظام */}
          <View style={styles.systemInfo}>
            <Text style={styles.systemInfoTitle}>معلومات النظام:</Text>
            <View style={styles.systemInfoItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#28a745"
              />
              <Text style={styles.systemInfoText}>نظام آمن ومعتمد</Text>
            </View>
            <View style={styles.systemInfoItem}>
              <Ionicons name="time-outline" size={16} color="#17a2b8" />
              <Text style={styles.systemInfoText}>خدمة 24/7</Text>
            </View>
            <View style={styles.systemInfoItem}>
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color="#6c757d"
              />
              <Text style={styles.systemInfoText}>دعم جميع الأجهزة</Text>
            </View>
          </View>
        </View>

        {/* معلومات الاتصال (للتطوير فقط) */}
        {__DEV__ && apiStatus && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>معلومات الاتصال:</Text>
            <Text style={styles.debugText}>
              الخادم: {apiStatus.backend_url}
            </Text>
            <Text style={styles.debugText}>
              الحالة: {backendConnected ? "✅ متصل" : "❌ غير متصل"}
            </Text>
            {apiStatus.error && (
              <Text style={[styles.debugText, { color: "#dc3545" }]}>
                الخطأ: {apiStatus.error}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center"
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#000",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22
  },
  connectionWarning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffeaa7",
    width: "100%"
  },
  connectionWarningText: {
    color: "#856404",
    fontSize: 14,
    marginRight: 8,
    fontWeight: "500"
  },
  formContainer: {
    width: "100%",
    maxWidth: 400
  },
  label: {
    width: "100%",
    textAlign: "right",
    color: "#333",
    fontSize: 15,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#d6d6d6",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    overflow: "hidden"
  },
  inputIcon: {
    marginHorizontal: 12
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: "right",
    color: "#333"
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: "right",
    color: "#333",
    paddingLeft: 12
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  forgotPasswordButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 20
  },
  forgotPasswordText: {
    color: "#269237",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline"
  },
  button: {
    backgroundColor: "#269237",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 15,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    opacity: 0.8
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"
  },
  quickLoginButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  quickLoginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500"
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%"
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dee2e6"
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#6c757d",
    fontSize: 14
  },
  registerButton: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#269237",
    backgroundColor: "#fff",
    gap: 8,
    marginBottom: 25
  },
  registerText: {
    color: "#269237",
    fontSize: 16,
    fontWeight: "700"
  },
  systemInfo: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef"
  },
  systemInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "right"
  },
  systemInfoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8
  },
  systemInfoText: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
    flex: 1,
    textAlign: "right"
  },
  debugInfo: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#dee2e6"
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 8,
    textAlign: "right"
  },
  debugText: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace"
  },
  registerLinkContainer: {
  flexDirection: 'row-reverse',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 30,
},
registerLinkText: {
  fontSize: 15,
  color: '#666',
},
registerLink: {
  color: "#269237",
  fontSize: 15,
  fontWeight: "700",
  textDecorationLine: 'underline',
},
});
