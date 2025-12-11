// D:\Projects\crabby-indigo-almond\WelcomeScreen.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import { getApiStatus } from "./api";

export default function WelcomeScreen({ navigation, route }) {
  const { backendConnected, backendError, backendInfo } = route.params || {};

  const handleLoginPress = () => {
    navigation.navigate("Login", {
      backendConnected: backendConnected,
      backendInfo: backendInfo
    });
  };

  const handleTestConnection = async () => {
    try {
      const status = await getApiStatus();

      Alert.alert(
        "حالة الاتصال",
        `الوصول: ${status.connected ? "✅ متصل" : "❌ غير متصل"}\n` +
          `الخادم: ${status.backend_url}\n` +
          `المراكز: ${status.centers_count || 0}\n` +
          `CatBoost: ${status.catboost_loaded ? "✅" : "❌"}\n` +
          `Prophet: ${status.prophet_loaded ? "✅" : "❌"}\n` +
          `الوقت: ${new Date(status.timestamp).toLocaleTimeString("ar-SA")}`,
        [{ text: "موافق" }]
      );
    } catch (error) {
      Alert.alert("خطأ", `تعذر فحص الاتصال: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>مرحباً بك في تَراص</Text>

      <Text style={styles.subtitle}>
        "تَـراص" تطبيق ذكي لإصدار الهوية الوطنية وجواز السفر، يقلل الازدحام
        ويقدم تجربة مبسّطة وسهلة.
      </Text>

      {/* حالة الاتصال */}
      <View
        style={[
          styles.connectionStatus,
          { backgroundColor: backendConnected ? "#d4edda" : "#f8d7da" }
        ]}
      >
        <Text
          style={[
            styles.connectionStatusText,
            { color: backendConnected ? "#155724" : "#721c24" }
          ]}
        >
          {backendConnected ? "✅ متصل بالخادم" : "⚠️ غير متصل بالخادم"}
        </Text>
        {backendError && (
          <Text style={styles.connectionErrorText}>{backendError}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
        <Text style={styles.buttonText}>تسجيل الدخول</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.registerButtonText}>إنشاء حساب جديد</Text>
      </TouchableOpacity>

      {/* زر فحص الاتصال (للتطوير فقط) */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
        >
          <Text style={styles.testButtonText}>فحص الاتصال</Text>
        </TouchableOpacity>
      )}

      {/* معلومات الاتصال (للتطوير فقط) */}
      {__DEV__ && backendInfo && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>معلومات التطوير:</Text>
          <Text style={styles.debugText}>
            الخادم: {backendInfo.backend_url}
          </Text>
          <Text style={styles.debugText}>
            الحالة: {backendInfo.connected ? "متصل" : "غير متصل"}
          </Text>
          <Text style={styles.debugText}>
            عدد المراكز: {backendInfo.centers_count || 0}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 25,
    resizeMode: "contain"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 15,
    color: "#000",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#444",
    lineHeight: 24,
    marginBottom: 30
  },
  connectionStatus: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    alignItems: "center"
  },
  connectionStatusText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  },
  connectionErrorText: {
    fontSize: 12,
    color: "#721c24",
    textAlign: "center",
    marginTop: 5
  },
  button: {
    backgroundColor: "#269237",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  testButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 15
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500"
  },
  debugInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#dee2e6"
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 5,
    textAlign: "right"
  },
  debugText: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginBottom: 3
  },
  registerButton: {
  backgroundColor: "#fff",
  paddingVertical: 16,
  paddingHorizontal: 60,
  borderRadius: 12,
  marginTop: 15,
  borderWidth: 2,
  borderColor: '#269237',
},
registerButtonText: {
  color: "#269237",
  fontSize: 18,
  fontWeight: "600",
},
});
