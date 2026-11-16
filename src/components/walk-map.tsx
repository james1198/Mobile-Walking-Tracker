import { Platform, StyleSheet, Text, View } from "react-native";

let MapView: any = null;
if (Platform.OS !== "web") {
  MapView = require("react-native-maps").default;
}

// This component renders the map for the walk screen.
export default function WalkMap({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) {
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
<View
  style={styles.container}
  onLayout={(event) => {
    const { width, height } = event.nativeEvent.layout;
    console.log("Map container size:", width, height);
  }}
>
      {MapView && latitude !== null && longitude !== null && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude!,
            longitude: longitude!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
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
  width: "100%",
  minHeight: 240,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  webMessage: {
    textAlign: "center",
    paddingHorizontal: 20,
    color: "#666",
    fontSize: 14,
  },
});