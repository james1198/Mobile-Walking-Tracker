import { Platform, StyleSheet, Text, View } from "react-native";

let MapView: any = null;
if (Platform.OS !== "web") {
  MapView = require("react-native-maps").default;
}

// This component renders the map for the walk screen.
export default function WalkMap() {
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.webMessage}>
          Map view is unavailable in the browser. Open this app in Expo Go on a
          mobile device for the live walking map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* This section renders the map view. */}
      {MapView && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      )}
    </View>
  );
}

// This section defines the component styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    minHeight: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webMessage: {
    textAlign: "center",
    paddingHorizontal: 20,
    color: "#666",
    fontSize: 14,
  },
});