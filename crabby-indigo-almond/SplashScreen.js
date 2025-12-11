// D:\Projects\crabby-indigo-almond\SplashScreen.js
import React, { useEffect } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { getApiStatus } from "./api";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // فحص اتصال Backend
        const status = await getApiStatus();
        
        // الانتقال بعد 2.5 ثانية
        const timer = setTimeout(() => {
          if (status.connected) {
            console.log('✅ الانتقال إلى Welcome مع اتصال Backend');
            navigation.replace("Welcome", { 
              backendConnected: true,
              backendInfo: status 
            });
          } else {
            console.log('⚠️ الانتقال إلى Welcome بدون اتصال Backend');
            navigation.replace("Welcome", { 
              backendConnected: false,
              backendError: status.error 
            });
          }
        }, 2500);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error in splash screen:', error);
        const timer = setTimeout(() => {
          navigation.replace("Welcome", { 
            backendConnected: false,
            backendError: error.message 
          });
        }, 2500);
        
        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("./assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>تَـراص</Text>
      <Text style={styles.appDescription}>تطبيق حجز مواعيد الأحوال المدنية</Text>
      
      {/* مؤشر التحميل */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot}></View>
        <View style={styles.loadingDot}></View>
        <View style={styles.loadingDot}></View>
      </View>
      
      <Text style={styles.version}>الإصدار 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#269237",
    marginBottom: 5,
  },
  appDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  loadingContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#269237",
    marginHorizontal: 5,
    opacity: 0.6,
  },
  version: {
    position: "absolute",
    bottom: 30,
    fontSize: 14,
    color: "#999",
  },
});