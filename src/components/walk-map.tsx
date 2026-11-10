import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
// This component renders the map for the walk screen.
export default function WalkMap() {
  return (
    <View style={styles.container}>
      {/* This section renders the map view. */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
}

// This section defines the component styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "80%",
    minHeight: 240,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});