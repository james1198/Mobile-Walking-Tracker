import { StyleSheet, Text, View } from "react-native";

export default function WalkMap() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.message}>
          Map view is available in the iOS and Android apps.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    minHeight: 240,
  },
  placeholder: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#e9eef2",
  },
  message: {
    color: "#475569",
    textAlign: "center",
  },
});
