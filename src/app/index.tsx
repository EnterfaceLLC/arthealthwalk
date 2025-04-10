import React, { useState, useEffect, useRef } from "react";
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
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { Stack } from "expo-router";
import { format } from "date-fns";

// Styles
import { styles } from "../styles/scrnStyles/index";

//Interfaces
import { Artwork, Coordinates, ArtDetailModalProps } from "../types/artwork";

// Add these new interfaces for step sessions
interface StepSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  steps: number;
  duration: string; // in minutes:seconds format
  artDiscovered: number;
}

interface SessionsModalProps {
  visible: boolean;
  sessions: StepSession[];
  onClose: () => void;
}

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

// Step Sessions History Modal Component
const StepSessionsModal: React.FC<SessionsModalProps> = ({
  visible,
  sessions,
  onClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Walking History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {sessions.length > 0 ? (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.sessionItem}>
                <Text style={styles.sessionDate}>{item.date}</Text>
                <View style={styles.sessionDetails}>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>Time:</Text>
                    <Text style={styles.sessionDetailValue}>
                      {item.startTime} - {item.endTime}
                    </Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>Duration:</Text>
                    <Text style={styles.sessionDetailValue}>{item.duration}</Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>Steps:</Text>
                    <Text style={styles.sessionDetailValue}>{item.steps}</Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>Art Discovered:</Text>
                    <Text style={styles.sessionDetailValue}>{item.artDiscovered}</Text>
                  </View>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptySessionsText}>
            You haven't saved any walking sessions yet. Start exploring to track your steps!
          </Text>
        )}

        <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
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

  // Session tracking state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionStartSteps, setSessionStartSteps] = useState(0);
  const [savedSessions, setSavedSessions] = useState<StepSession[]>([]);
  const [sessionsModalVisible, setSessionsModalVisible] = useState(false);
  const [sessionArtDiscovered, setSessionArtDiscovered] = useState<Set<string>>(new Set());

  // Location state
  const [nearestArt, setNearestArt] = useState<Artwork | null>(null);
  const [visitedArt, setVisitedArt] = useState<Artwork[]>([]);

  // Modal state
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Reference to store pedometer subscription
  const pedometerSubscriptionRef = useRef<any>(null);

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
      setPedometerPermissionGranted(true);
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

  // Calculate session duration in minutes:seconds format
  const calculateSessionDuration = (start: Date, end: Date): string => {
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start a new walking session
  const startWalkingSession = () => {
    if (!isPedometerAvailable || (Platform.OS === "android" && !pedometerPermissionGranted)) {
      Alert.alert(
        "Cannot Start Session", 
        "Step counting is not available. Please grant permissions first."
      );
      return;
    }

    setSessionStartTime(new Date());
    setSessionStartSteps(currentStepCount);
    setSessionArtDiscovered(new Set());
    setIsSessionActive(true);
    
    Alert.alert("Session Started", "Your walking session has begun. Explore and discover art!");
  };

  // End current walking session
  const endWalkingSession = () => {
    if (!sessionStartTime) return;
    
    const endTime = new Date();
    const sessionSteps = currentStepCount - sessionStartSteps;
    const duration = calculateSessionDuration(sessionStartTime, endTime);
    
    // Create new session object
    const newSession: StepSession = {
      id: Date.now().toString(),
      date: format(endTime, "MMMM d, yyyy"),
      startTime: format(sessionStartTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      steps: sessionSteps,
      duration,
      artDiscovered: sessionArtDiscovered.size,
    };
    
    // Add to saved sessions
    setSavedSessions(prevSessions => [newSession, ...prevSessions]);
    
    // Reset session state
    setIsSessionActive(false);
    setSessionStartTime(null);
    setSessionStartSteps(0);
    setSessionArtDiscovered(new Set());
    
    Alert.alert(
      "Session Saved", 
      `You walked ${sessionSteps} steps in ${duration} and discovered ${sessionArtDiscovered.size} art pieces.`,
      [
        { text: "View History", onPress: () => setSessionsModalVisible(true) },
        { text: "OK" }
      ]
    );
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

        pedometerSubscriptionRef.current = subscription;

        return () => {
          if (pedometerSubscriptionRef.current) {
            pedometerSubscriptionRef.current.remove();
          }
        };
      } catch (error) {
        console.error("Error setting up pedometer:", error);
        Alert.alert("Pedometer Error", "Could not start step counting.");
      }
    };

    setupPedometer();
  }, [pedometerPermissionGranted]);

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

                  // If session is active, add to session discoveries
                  if (isSessionActive) {
                    setSessionArtDiscovered(prev => {
                      const updated = new Set(prev);
                      updated.add(fullArtDetails.id.toString());
                      return updated;
                    });
                  }
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
  }, [nearestArt, visitedArt, currentStepCount, isSessionActive]);

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

  // Show sessions history modal
  const showSessionsHistory = () => {
    setSessionsModalVisible(true);
  };

  // Close sessions history modal
  const closeSessionsHistory = () => {
    setSessionsModalVisible(false);
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
                
                {/* Session Controls */}
                <View style={styles.sessionControls}>
                  {isSessionActive ? (
                    <>
                      <Text style={styles.sessionActiveText}>
                        Session Active: {sessionStartSteps > 0 ? (currentStepCount - sessionStartSteps) : currentStepCount} steps
                      </Text>
                      <TouchableOpacity
                        style={[styles.sessionButton, styles.endSessionButton]}
                        onPress={endWalkingSession}
                      >
                        <Text style={styles.sessionButtonText}>End Session</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.sessionButton, styles.startSessionButton]}
                      onPress={startWalkingSession}
                    >
                      <Text style={styles.sessionButtonText}>Start Walking Session</Text>
                    </TouchableOpacity>
                  )}
                  
                  {savedSessions.length > 0 && !isSessionActive && (
                    <TouchableOpacity
                      style={[styles.sessionButton, styles.historyButton]}
                      onPress={showSessionsHistory}
                    >
                      <Text style={styles.sessionButtonText}>View History</Text>
                    </TouchableOpacity>
                  )}
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

      {/* Step Sessions History Modal */}
      <StepSessionsModal
        visible={sessionsModalVisible}
        sessions={savedSessions}
        onClose={closeSessionsHistory}
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
