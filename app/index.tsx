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

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Pedometer } from "expo-sensors";

const StepCounter = () => {
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [stepGoal] = useState(20); // Example daily goal

  // Check if pedometer is available
  useEffect(() => {
    const checkPedometer = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        // Subscribe to step count updates
        const subscription = Pedometer.watchStepCount((result) => {
          setCurrentStepCount(result.steps);
          checkStepGoal(result.steps); // Trigger goal check
        });

        return () => subscription && subscription.remove();
      }
    };

    checkPedometer();
  }, []);

  // Check if user reached their step goal
  const checkStepGoal = (steps: number) => {
    if (steps >= stepGoal) {
      Alert.alert(
        "🎉 Goal Achieved!",
        `You've walked ${stepGoal} steps! Time to explore nearby art.`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Steps</Text>
      {isPedometerAvailable ? (
        <>
          <Text style={styles.stepCount}>{currentStepCount}</Text>
          <Text style={styles.goalText}>Goal: {stepGoal} steps</Text>
          <Text style={styles.hint}>
            Walk {Math.max(0, stepGoal - currentStepCount)} more steps to unlock
            an art hint!
          </Text>
        </>
      ) : (
        <Text style={styles.error}>
          Step counter not available on this device.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2ecc71", // Green for progress
  },
  goalText: {
    fontSize: 18,
    color: "#7f8c8d", // Gray for secondary text
    marginTop: 10,
  },
  hint: {
    fontSize: 16,
    color: "#3498db", // Blue for hints
    marginTop: 20,
    textAlign: "center",
  },
  error: {
    fontSize: 18,
    color: "#e74c3c", // Red for errors
  },
});

export default StepCounter;
