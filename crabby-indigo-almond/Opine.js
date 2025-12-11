import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function Opine({ navigation }) {
  const cities = ["الرياض", "جدة", "الدمام"];

  const times = {
    "الرياض": ["10:00 ص", "11:30 ص", "1:00 م"],
    "جدة": ["9:00 ص", "12:00 م", "3:30 م"],
    "الدمام": ["8:30 ص", "10:30 ص", "2:00 م"],
  };

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>اختر المدينة</Text>

      {/* اختيار المدينة */}
      <View style={styles.box}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.option,
              selectedCity === city && styles.selectedOption,
            ]}
            onPress={() => {
              setSelectedCity(city);
              setSelectedTime(null);
            }}
          >
            <Text style={styles.optionText}>{city}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* اختيار الموعد */}
      {selectedCity && (
        <>
          <Text style={[styles.title, { marginTop: 25 }]}>
            المواعيد المتاحة في {selectedCity}
          </Text>

          <View style={styles.box}>
            {times[selectedCity].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.option,
                  selectedTime === time && styles.selectedOption,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={styles.optionText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* زر تأكيد */}
      {selectedCity && selectedTime && (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() =>
            navigation.navigate("Success", {
              city: selectedCity,
              time: selectedTime,
            })
          }
        >
          <Text style={styles.confirmText}>تأكيد الحجز</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
  },
  box: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
  },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedOption: {
    borderColor: "#4B8DF8",
    backgroundColor: "#e9f0ff",
  },
  optionText: {
    fontSize: 18,
    textAlign: "right",
  },
  confirmBtn: {
    backgroundColor: "#4B8DF8",
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});
