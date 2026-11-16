import { StyleSheet, Text, TextInput, View } from "react-native";

export default function WalkNotes() {
  return (
    <View style={styles.container}>
      <Text>Walk Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your walk notes"
        maxLength={200}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "80%",
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
});