import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  historyItem: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    borderRadius: 8,
  },
  historyItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  historyItemText: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  historyItemArtist: {
    fontSize: 14,
    color: "#666",
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
  viewDetailsText: {
    fontSize: 13,
    color: "#3498db",
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    padding: 20,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  artImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  artDetailArtist: {
    fontSize: 18,
    color: "#666",
    marginBottom: 15,
  },
  artDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },
  closeModalButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  // Session controls
  sessionControls: {
    marginTop: 20,
    width: "100%",
  },
  sessionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  startSessionButton: {
    backgroundColor: "#2ecece",
  },
  endSessionButton: {
    backgroundColor: "#e74c3c",
  },
  historyButton: {
    backgroundColor: "#3498db",
  },
  sessionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sessionActiveText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 10,
  },

  // Session history modal styles
  sessionItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sessionDate: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sessionDetails: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
  },
  sessionDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sessionDetailLabel: {
    fontWeight: "500",
    color: "#666",
  },
  sessionDetailValue: {
    fontWeight: "600",
  },
  emptySessionsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 30,
  },
});
