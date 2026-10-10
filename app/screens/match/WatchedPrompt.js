import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const WatchedPrompt = ({ movie, onAnswer, onCancel }) => (
  <Modal transparent animationType="fade" visible={movie != null} onRequestClose={onCancel}>
    <View style={styles.backdrop}>
      <View style={styles.dialog}>
        <Text style={styles.title}>Already watched {movie?.title}?</Text>
        <Text style={styles.subtitle}>Did you like it?</Text>
        <View style={styles.answers}>
          <Pressable style={styles.answer} onPress={() => onAnswer(false)}>
            <Ionicons name="thumbs-down" size={36} color="red" />
            <Text>Didn't like it</Text>
          </Pressable>
          <Pressable style={styles.answer} onPress={() => onAnswer(true)}>
            <Ionicons name="thumbs-up" size={36} color="green" />
            <Text>Liked it</Text>
          </Pressable>
        </View>
        <Pressable onPress={onCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

export default WatchedPrompt;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: "#666",
  },
  answers: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 20,
  },
  answer: {
    alignItems: "center",
  },
  cancel: {
    fontSize: 16,
    color: "#666",
  },
});
