import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, View } from "react-native";

type WalkNote = {
  id: string;
  text: string;
  createdAt: string;
  syncStatus: "pending";
};

export default function WalkNotes() {
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteTextState] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
  async function loadNotes() {
    try {
      const savedNotes = await AsyncStorage.getItem("walkNotes");

      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      alert("Could not load saved notes.");
    }
  }

  loadNotes();
}, []);

  function setNoteText(text: string): void {
    setNoteTextState(text);
  }

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
      <Text style ={{ color: "#FFFFFF", marginBottom: 10 }}>
        maximum 200 characters. Characters left: {200 - noteText.length}
      </Text>
      <Button
        title="Done Typing"
        onPress={() => Keyboard.dismiss()}
      />
      <Button
        title="Save Note"
        onPress={async () => {
          if (noteText.trim() === "") {
            setStatusMessage("Cannot save empty notes.");
            return;
          }
          if (noteText.trim().length > 200) {
            setStatusMessage("Note is too long.");
            return;
          }

          const newNote: WalkNote = {
            id: Date.now().toString(),
            text: noteText.trim(),
            createdAt: new Date().toISOString(),
            syncStatus: "pending",
          };

          const updatedNotes = [...notes, newNote.text];

          try {
            await AsyncStorage.setItem("walkNotes", JSON.stringify(updatedNotes));
            setNotes(updatedNotes);
            setNoteText("");
            Keyboard.dismiss();
          } catch (error) {
            console.error("Error saving notes:", error);
            alert("Failed to save notes. Please try again.");
          }
        }}
      />
      <Button
        title="Sync Now"
        onPress={() => {
          setStatusMessage("Sync is not implemented yet.");
        }}
      />
      <Text style={{ color: "#FFFFFF", marginTop: 10 }}>
        {statusMessage}
      </Text>
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