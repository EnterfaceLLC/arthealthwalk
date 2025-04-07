import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";

// Art locations with coordinates (50 feet = ~0.0095 miles)
const ART_LOCATIONS = [
  {
    id: 1,
    name: "Sunset Mural",
    artist: "Jane Doe",
    coords: { latitude: 34.0522, longitude: -118.2437 },
    triggerDistance: 0.0095, // 50 feet in miles
    visited: false,
  },
  {
    id: 2,
    name: "Casa de Zamora",
    artist: "Rogelio ZamZam",
    coords: { latitude: 38.9797, longitude: -95.7198 },
    triggerDistance: 0.0095, // 50 feet in miles
    visited: false,
  },
  // Add more artworks...
];

export default function ArtHealthWalk() {
  // Step counter state
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [stepGoal] = useState(1000); // Daily goal

  // Location state
  const [nearestArt, setNearestArt] = useState(null);
  const [visitedArt, setVisitedArt] = useState([]);

  // Check if user is within 50 feet of artwork
  const isWithin50Feet = (loc1, loc2) => {
    const latDiff = loc2.latitude - loc1.latitude;
    const lonDiff = loc2.longitude - loc1.longitude;
    const distanceInMiles =
      Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69;
    return distanceInMiles <= 0.0095; // 50 feet threshold
  };

  // Initialize pedometer
  useEffect(() => {
    const setupPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        const subscription = Pedometer.watchStepCount((result) => {
          setCurrentStepCount(result.steps);
        });

        return () => subscription && subscription.remove();
      }
    };

    setupPedometer();
  }, []);

  // Initialize location tracking
  useEffect(() => {
    let locationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Enable location to discover nearby art"
        );
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 15, // Update every ~15m
        },
        (location) => {
          const userCoords = location.coords;
          let foundArt = null;

          // Check if user is near any artwork
          ART_LOCATIONS.forEach((art) => {
            if (isWithin50Feet(userCoords, art.coords)) {
              foundArt = {
                id: art.id,
                name: art.name,
                artist: art.artist,
              };

              // If this is a new art discovery, add to visited list
              if (!visitedArt.some((item) => item.id === art.id)) {
                setVisitedArt((prev) => [...prev, foundArt]);

                // Alert user about art discovery and encourage walking
                const remainingSteps = Math.max(0, stepGoal - currentStepCount);
                Alert.alert(
                  "Art Discovery!",
                  `You've found "${foundArt.name}" by ${foundArt.artist}!\n\n` +
                    `You've walked ${currentStepCount} steps today.\n` +
                    `${remainingSteps} more steps to reach your daily goal.`,
                  [{ text: "Continue Exploring" }]
                );
              }
            }
          });

          if (foundArt && (!nearestArt || nearestArt.id !== foundArt.id)) {
            setNearestArt(foundArt);
          } else if (!foundArt && nearestArt) {
            setNearestArt(null);
          }
        }
      );
    };

    startTracking();
    return () => locationSubscription?.remove();
  }, [nearestArt, visitedArt, currentStepCount]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepSection}>
        <Text style={styles.title}>Walk of Art</Text>

        {/* Step Counter Section */}
        <View style={styles.metricContainer}>
          <Text style={styles.metricLabel}>Today's Steps</Text>
          {isPedometerAvailable ? (
            <>
              <Text style={styles.stepCount}>{currentStepCount}</Text>
              <Text style={styles.goalText}>Goal: {stepGoal} steps</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        (currentStepCount / stepGoal) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={styles.error}>
              Step counter not available on this device
            </Text>
          )}
        </View>
      </View>

      {/* Art Proximity Section */}
      <View style={styles.artSection}>
        <Text style={styles.sectionTitle}>Nearby Art</Text>
        {nearestArt ? (
          <View style={styles.artCard}>
            <Text style={styles.artName}>{nearestArt.name}</Text>
            <Text style={styles.artArtist}>by {nearestArt.artist}</Text>
            <Text style={styles.proximityText}>You are within 50 feet!</Text>
          </View>
        ) : (
          <Text style={styles.hint}>
            Walk around to discover public art nearby
          </Text>
        )}
      </View>

      {/* Art Discovery History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          Art Discoveries ({visitedArt.length})
        </Text>
        {visitedArt.length > 0 ? (
          visitedArt.map((art) => (
            <View key={art.id} style={styles.historyItem}>
              <Text style={styles.historyItemText}>
                {art.name} by {art.artist}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.hint}>Start walking to discover art!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  stepSection: {
    marginBottom: 30,
  },
  artSection: {
    marginBottom: 30,
  },
  historySection: {
    marginBottom: 30,
  },
  metricContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 16,
    color: "#666",
  },
  stepCount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2ecc71",
    marginVertical: 5,
  },
  goalText: {
    fontSize: 16,
    color: "#666",
  },
  progressBar: {
    height: 10,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  artCard: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#3498db",
  },
  artName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  artArtist: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  proximityText: {
    color: "#3498db",
    fontWeight: "bold",
  },
  historyItem: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    borderRadius: 8,
  },
  historyItemText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  error: {
    fontSize: 16,
    color: "#e74c3c",
    marginTop: 10,
  },
});
