import { StyleSheet, Text, View } from "react-native";

export default function WalkNotes() {
  return (
    <View style={styles.container}>
      <Text>Walk Notes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});