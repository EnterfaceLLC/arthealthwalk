import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  PermissionsAndroid,
} from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { Stack } from "expo-router";

// Styles
import { styles } from "../styles/scrnStyles/index";

//Interfaces
import { Artwork, Coordinates, ArtDetailModalProps } from "../types/artwork";

// Art locations with coordinates (50 feet = ~0.0095 miles)
import ART_LOCATIONS from "../../assets/mock/public_art.json";

// Art Detail Modal Component
const ArtDetailModal: React.FC<ArtDetailModalProps> = ({
  visible,
  art,
  onClose,
}) => {
  if (!art) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{art.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {art.image && (
          <Image
            source={{ uri: art.image }}
            style={styles.artImage}
            resizeMode="cover"
          />
        )}

        <Text style={styles.artDetailArtist}>By {art.artist}</Text>
        <Text style={styles.artDescription}>{art.description}</Text>

        <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

export default function ArtHealthWalk() {
  // Step counter state
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [stepGoal] = useState(100); // Daily goal
  const [pedometerPermissionGranted, setPedometerPermissionGranted] =
    useState(false);

  // Location state
  const [nearestArt, setNearestArt] = useState<Artwork | null>(null);
  const [visitedArt, setVisitedArt] = useState<Artwork[]>([]);

  // Modal state
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Check if user is within 50 feet of artwork
  const isWithin50Feet = (loc1: Coordinates, loc2: Coordinates): boolean => {
    const latDiff = loc2.latitude - loc1.latitude;
    const lonDiff = loc2.longitude - loc1.longitude;
    const distanceInMiles =
      Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69;
    return distanceInMiles <= 0.0095; // 50 feet threshold
  };

  // Request Android activity recognition permission
  const requestActivityPermission = async () => {
    if (Platform.OS !== "android") {
      // iOS doesn't need explicit permission for pedometer
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: "Activity Recognition Permission",
          message:
            "This app needs access to your physical activity to count steps while you explore art.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Activity recognition permission granted");
        setPedometerPermissionGranted(true);
        return true;
      } else {
        console.log("Activity recognition permission denied");
        Alert.alert(
          "Limited Functionality",
          "Step counting will not work without activity permission. You can still discover art."
        );
        return false;
      }
    } catch (err) {
      console.warn("Error requesting activity permission:", err);
      return false;
    }
  };

  // Initialize pedometer
  useEffect(() => {
    const setupPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (!isAvailable) {
        console.log("Pedometer is not available on this device");
        return;
      }

      // Request permissions if needed (Android only)
      if (Platform.OS === "android") {
        const permissionGranted = await requestActivityPermission();
        if (!permissionGranted) {
          return;
        }
      }

      try {
        const subscription = Pedometer.watchStepCount((result) => {
          console.log("Steps updated:", result.steps);
          setCurrentStepCount(result.steps);
        });

        return () => subscription && subscription.remove();
      } catch (error) {
        console.error("Error setting up pedometer:", error);
        Alert.alert("Pedometer Error", "Could not start step counting.");
      }
    };

    setupPedometer();
  }, []);

  // Initialize location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

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
          let foundArt: Artwork | undefined;

          // Check if user is near any artwork
          ART_LOCATIONS.forEach((art) => {
            if (isWithin50Feet(userCoords, art.coords)) {
              // Find full art details from ART_LOCATIONS
              const fullArtDetails = ART_LOCATIONS.find((a) => a.id === art.id);
              if (!fullArtDetails) return; // Early return if undefined

              foundArt = fullArtDetails;

              // If this is a new art discovery, add to visited list
              if (!visitedArt.some((item) => item.id === art.id)) {
                if (fullArtDetails) {
                  setVisitedArt((prev) => [...prev, fullArtDetails]);
                }

                // Alert user about art discovery and encourage walking
                const remainingSteps = Math.max(0, stepGoal - currentStepCount);
                Alert.alert(
                  "Art Discovery!",
                  `You've found "${foundArt.name}" by ${foundArt.artist}!\n\n` +
                    `You've walked ${currentStepCount} steps today.\n` +
                    `${remainingSteps} more steps to reach your daily goal.`,
                  [
                    {
                      text: "View Details",
                      onPress: () => showArtDetail(fullArtDetails),
                    },
                    { text: "Continue Exploring" },
                  ]
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

  // Show art detail modal
  const showArtDetail = (art: Artwork) => {
    setSelectedArt(art);
    setModalVisible(true);
  };

  // Close art detail modal
  const closeArtDetail = () => {
    setModalVisible(false);
  };

  // Add a button to request permissions again if initially denied
  const requestPermissionsAgain = () => {
    requestActivityPermission();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepSection}>
        <Text style={styles.title}>Walk of Art</Text>

        {/* Step Counter Section */}
        <View style={styles.metricContainer}>
          <Text style={styles.metricLabel}>Today's Steps</Text>
          {isPedometerAvailable ? (
            Platform.OS === "android" && !pedometerPermissionGranted ? (
              // Show permission request button for Android if permission not granted
              <View>
                <Text style={styles.error}>
                  Activity permission required for step counting
                </Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissionsAgain}
                >
                  <Text style={styles.permissionButtonText}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Normal step counter display when permissions are granted
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
            )
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
          <TouchableOpacity
            style={styles.artCard}
            onPress={() => showArtDetail(nearestArt)}
          >
            <Text style={styles.artName}>{nearestArt.name}</Text>
            <Text style={styles.artArtist}>by {nearestArt.artist}</Text>
            <Text style={styles.proximityText}>You are within 50 feet!</Text>
            <Text style={styles.viewDetailsText}>Tap to view details</Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              key={art.id}
              style={styles.historyItem}
              onPress={() => showArtDetail(art)}
            >
              <View style={styles.historyItemContent}>
                {art.image && (
                  <Image
                    source={{ uri: art?.image }}
                    style={styles.historyItemImage}
                  />
                )}
                <View style={styles.historyItemText}>
                  <Text style={styles.historyItemTitle}>{art.name}</Text>
                  <Text style={styles.historyItemArtist}>by {art.artist}</Text>
                  <Text style={styles.viewDetailsText}>
                    Tap to view details
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.hint}>Start walking to discover art!</Text>
        )}
      </View>

      {/* Art Detail Modal */}
      <ArtDetailModal
        visible={modalVisible}
        art={selectedArt}
        onClose={closeArtDetail}
      />

      <Stack.Screen
        options={{
          title: "Art Health Walk 2.0",
          headerStyle: {
            backgroundColor: "#AB274F",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </ScrollView>
  );
}
