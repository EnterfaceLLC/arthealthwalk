// import { useState, useEffect } from "react";
// import { StyleSheet, Text, View } from "react-native";
// import { Pedometer } from "expo-sensors";

// export default function App() {
//   const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
//   const [pastStepCount, setPastStepCount] = useState(0);
//   const [currentStepCount, setCurrentStepCount] = useState(0);

//   const subscribe = async () => {
//     const isAvailable = await Pedometer.isAvailableAsync();
//     setIsPedometerAvailable(String(isAvailable));

//     if (isAvailable) {
//       const end = new Date();
//       const start = new Date();
//       start.setDate(end.getDate() - 1);

//       const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
//       if (pastStepCountResult) {
//         setPastStepCount(pastStepCountResult.steps);
//       }

//       return Pedometer.watchStepCount((result) => {
//         setCurrentStepCount(result.steps);
//       });
//     }
//   };

//   useEffect(() => {
//     subscribe();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text>Pedometer.isAvailableAsync(): {isPedometerAvailable}</Text>
//       <Text>Steps taken in the last 24 hours: {pastStepCount}</Text>
//       <Text>Walk! And watch this go up: {currentStepCount}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, Alert } from "react-native";
// import { Pedometer } from "expo-sensors";

// const StepCounter = () => {
//   const [currentStepCount, setCurrentStepCount] = useState(0);
//   const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
//   const [stepGoal] = useState(20); // Example daily goal

//   // Check if pedometer is available
//   useEffect(() => {
//     const checkPedometer = async () => {
//       const isAvailable = await Pedometer.isAvailableAsync();
//       setIsPedometerAvailable(isAvailable);

//       if (isAvailable) {
//         // Subscribe to step count updates
//         const subscription = Pedometer.watchStepCount((result) => {
//           setCurrentStepCount(result.steps);
//           checkStepGoal(result.steps); // Trigger goal check
//         });

//         return () => subscription && subscription.remove();
//       }
//     };

//     checkPedometer();
//   }, []);

//   // Check if user reached their step goal
//   const checkStepGoal = (steps: number) => {
//     if (steps >= stepGoal) {
//       Alert.alert(
//         "🎉 Goal Achieved!",
//         `You've walked ${stepGoal} steps! Time to explore nearby art.`,
//         [{ text: "OK" }]
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Daily Steps</Text>
//       {isPedometerAvailable ? (
//         <>
//           <Text style={styles.stepCount}>{currentStepCount}</Text>
//           <Text style={styles.goalText}>Goal: {stepGoal} steps</Text>
//           <Text style={styles.hint}>
//             Walk {Math.max(0, stepGoal - currentStepCount)} more steps to unlock
//             an art hint!
//           </Text>
//         </>
//       ) : (
//         <Text style={styles.error}>
//           Step counter not available on this device.
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   stepCount: {
//     fontSize: 48,
//     fontWeight: "bold",
//     color: "#2ecc71", // Green for progress
//   },
//   goalText: {
//     fontSize: 18,
//     color: "#7f8c8d", // Gray for secondary text
//     marginTop: 10,
//   },
//   hint: {
//     fontSize: 16,
//     color: "#3498db", // Blue for hints
//     marginTop: 20,
//     textAlign: "center",
//   },
//   error: {
//     fontSize: 18,
//     color: "#e74c3c", // Red for errors
//   },
// });

// export default StepCounter;

// import { useState, useEffect } from "react";
// import { Platform, Text, View, StyleSheet } from "react-native";

// import * as Location from "expo-location";

// export default function App() {
//   const [location, setLocation] = useState<Location.LocationObject | null>(
//     null
//   );
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   useEffect(() => {
//     async function getCurrentLocation() {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setErrorMsg("Permission to access location was denied");
//         return;
//       }

//       let location = await Location.getCurrentPositionAsync({});
//       setLocation(location);
//     }

//     getCurrentLocation();
//   }, []);

//   let text = "Waiting...";
//   if (errorMsg) {
//     text = errorMsg;
//   } else if (location) {
//     text = JSON.stringify(location);
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.paragraph}>{text}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
//   paragraph: {
//     fontSize: 18,
//     textAlign: "center",
//   },
// });

import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import * as Location from "expo-location";

// Art locations with coordinates and trigger distance in miles
const ART_LOCATIONS = [
  {
    id: 1,
    name: "Sunset Mural",
    artist: "Jorge Cabrono",
    coords: { latitude: 39.068581, longitude: -95.66589 },
    triggerDistance: 0.0094697, // 0.1 miles (~2 city blocks) ~50ft
  },
  {
    id: 2,
    name: "Govrmt Arte",
    artist: "Misty Howard-Gee",
    coords: { latitude: 38.981626, longitude: -95.719126 },
    triggerDistance: 0.0094697, // 0.1 miles (~2 city blocks) ~50ft
  },

  {
    id: 3,
    name: "Mall (sh)Art",
    artist: "Novi Dianas",
    coords: { latitude: 39.033499, longitude: -95.767704 },
    triggerDistance: 0.0094697, // 0.1 miles (~2 city blocks) ~50ft
  },

  // Add more artworks as needed
];

// Simplified distance calculation (returns miles)
const getDistanceInMiles = (loc1, loc2) => {
  const latDiff = loc2.latitude - loc1.latitude;
  const lonDiff = loc2.longitude - loc1.longitude;

  // Approximation good enough for short distances
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69;
};

export default function ArtProximityDetector() {
  const [nearestArt, setNearestArt] = useState<null | {
    name: string;
    artist: string;
    distance: string;
  }>(null);

  // Initialize location tracking
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Low, distanceInterval: 100 }, // Update every ~100m
        handleLocationUpdate
      );
    };

    const handleLocationUpdate = (location: Location.LocationObject) => {
      const userCoords = location.coords;
      let closestArt = null;
      let minDistance = Infinity;

      ART_LOCATIONS.forEach((art) => {
        const distance = getDistanceInMiles(userCoords, art.coords);
        if (distance < art.triggerDistance && distance < minDistance) {
          minDistance = distance;
          closestArt = art;
        }
      });

      if (closestArt) {
        setNearestArt({
          name: closestArt.name,
          artist: closestArt.artist,
          distance: minDistance.toFixed(3),
        });
        Alert.alert(
          "Art Nearby!",
          `You're within ${closestArt.triggerDistance} miles of "${closestArt.name}"`
        );
      } else {
        setNearestArt(null);
      }
    };

    startTracking();
    return () => locationSubscription?.remove();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {nearestArt ? (
        <Text>
          Nearest artwork: {nearestArt.name} ({nearestArt.distance} miles)
        </Text>
      ) : (
        <Text>Walk toward the arts district to discover nearby artworks</Text>
      )}
    </View>
  );
}
