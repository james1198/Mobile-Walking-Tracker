import { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, View } from "react-native";

export default function WalkNotes() {
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteText] = useState<string>("");

  return (
    <View style={styles.container}>
      <Text>Walk Notes</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="Enter your walk notes"
        maxLength={200}
        multiline
        value={noteText}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
        onChangeText={setNoteText}
      />
      <Button
        title="Done Typing"
        onPress={() => Keyboard.dismiss()}
      />
      <Button
        title="Save Notes"
        onPress={() => {
          if (noteText.trim() === "") return;

          setNotes([...notes, noteText.trim()]);
          setNoteText("");
          Keyboard.dismiss();
        }}
      />
      {notes.map((note, index) => (
      <Text key={index} style={{ color: "#FFFFFF", marginTop: 10 }}>
        {note}
      </Text>
    ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    backgroundColor: "#333333",
  },
});