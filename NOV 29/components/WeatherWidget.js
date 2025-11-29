import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const GEONAMES_USERNAME = "PutUsernameHere";

const DEFAULT_COORDS = {
  lat: 49.19,
  lng: -123.17,
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const url = `https://secure.geonames.org/findNearByWeatherJSON?lat=${DEFAULT_COORDS.lat}&lng=${DEFAULT_COORDS.lng}&username=${GEONAMES_USERNAME}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");

        const data = await response.json();
        if (!mounted) return;

        if (!data.weatherObservation) throw new Error("No weather data");

        setWeather(data.weatherObservation);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="black" />
        <Text style={styles.statusText}>Loading weather…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.city}>{weather.stationName}</Text>
      <Text style={styles.temp}>{weather.temperature}°C</Text>
      <Text style={styles.detail}>Humidity: {weather.humidity}%</Text>
      <Text style={styles.detail}>Wind: {weather.windSpeed} m/s</Text>
      <Text style={styles.detail}>Clouds: {weather.clouds}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  box: {
    backgroundColor: "#FFF3D2",
    borderRadius: 12,
    padding: 12,
    width: "90%",
    alignSelf: "center",
    marginBottom: 15,
    marginTop: -10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  city: { textAlign: "center", fontSize: 16, fontWeight: "600" },
  temp: { textAlign: "center", fontSize: 28, fontWeight: "700", marginTop: 4 },
  detail: { textAlign: "center", fontSize: 12, marginTop: 2 },
});
