// App.js - النسخة الكاملة المحدثة
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, ActivityIndicator, Alert } from "react-native";

// استيراد الـ APIs
import { getApiStatus, healthCheck } from "./api";

// الشاشات
import SplashScreen from "./SplashScreen";
import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./LoginScreen";
import HomeScreen from "./HomeScreen";
import AppointmentScreen from "./AppointmentScreen";
import SettingsScreen from "./SettingsScreen";
import ConfirmScreen from "./ConfirmScreen";
import NotificationsScreen from "./NotificationsScreen";
import SignupScreen from "./SignupScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ====== ⭐ شاشة تحميل الاتصال ======
function ConnectionLoader() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
      }}
    >
      <ActivityIndicator size="large" color="#269237" />
      <Text style={{ marginTop: 20, fontSize: 16, color: "#333" }}>
        جاري الاتصال بالخادم...
      </Text>
    </View>
  );
}

// ====== ⭐ تاب بار أسفل التطبيق ======
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#269237",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 60,
          paddingBottom: 7,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "#fff"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500"
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "HomeTab") iconName = "home-outline";
          else if (route.name === "NotificationsTab")
            iconName = "notifications-outline";
          else if (route.name === "SettingsTab") iconName = "settings-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: "المواعيد",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

// ====== ⭐ التطبيق الرئيسي ======
export default function App() {
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendInfo, setBackendInfo] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      console.log("🔍 فحص اتصال Backend...");
      const status = await getApiStatus();

      setBackendInfo(status);

      if (status.connected) {
        console.log("✅ Backend متصل بنجاح:", status);
        setIsBackendConnected(true);

        // عرض معلومات الاتصال للمطور (يمكن إزالته في الإصدار النهائي)
        console.log("📊 معلومات الاتصال:", {
          url: status.backend_url,
          centers: status.centers_count,
          health: status.health_status
        });
      } else {
        console.warn("⚠️ Backend غير متصل:", status.error);
        setIsBackendConnected(false);

        // تحذير للمستخدم (فقط في وضع التطوير)
        if (__DEV__) {
          Alert.alert(
            "تنبيه",
            `لا يمكن الاتصال بالخادم:\n${status.error}\n\nسيتم استخدام بيانات تجريبية.`,
            [{ text: "موافق" }]
          );
        }
      }
    } catch (error) {
      console.error("❌ خطأ في فحص الاتصال:", error);
      setIsBackendConnected(false);

      if (__DEV__) {
        Alert.alert(
          "خطأ في الاتصال",
          `تعذر الاتصال بالخادم:\n${
            error.message
          }\n\nتأكد من:\n1. تشغيل Backend Python\n2. العنوان الصحيح: ${
            backendInfo?.backend_url || "http://localhost:8000"
          }`,
          [{ text: "موافق" }]
        );
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleRetryConnection = () => {
    setIsCheckingConnection(true);
    checkBackendConnection();
  };

  // شاشة التحميل أثناء فحص الاتصال
  if (isCheckingConnection) {
    return <ConnectionLoader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right"
        }}
      >
        {/* شاشات البداية */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          initialParams={{
            backendConnected: isBackendConnected,
            backendInfo: backendInfo
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ backendConnected: isBackendConnected }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{
            headerShown: false,
            title: "إنشاء حساب"
          }}
        />
        {/* الشاشة الرئيسية بعد التسجيل */}
        <Stack.Screen
          name="Home"
          component={BottomTabs}
          options={{ gestureEnabled: false }}
        />
        {/* شاشات إضافية */}
        <Stack.Screen
          name="Appointment"
          component={AppointmentScreen}
          initialParams={{
            backendConnected: isBackendConnected,
            backendInfo: backendInfo
          }}
        />
        <Stack.Screen name="Confirm" component={ConfirmScreen} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          initialParams={{ backendConnected: isBackendConnected }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
