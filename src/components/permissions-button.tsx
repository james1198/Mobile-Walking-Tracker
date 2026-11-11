import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Button, Platform, StyleSheet, View } from "react-native";
// This section defines the background location task name.
const LOCATION_TASK_NAME = "background-location-task";
// This section defines the permission request function.
const requestPermissions = async () => {
  if (Platform.OS === "web") {
    console.warn("Location tracking is not available in the browser preview.");
    return;
  }

  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  // This section logs the foreground permission status.
  console.log("foregroundStatus", foregroundStatus);
  // This section stops the permission request if foreground permissions are not granted.
  if (foregroundStatus !== "granted") {
    return;
  }

  // This section requests background permissions.
  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();
  console.log("backgroundStatus", backgroundStatus);
  // This section logs the background permission status.

  // This section starts background location updates if permissions are granted.
  if (backgroundStatus === "granted") {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
    });
  }
};

// This section defines the permissions button component.
const PermissionsButton = ({ title }: { title?: string | null }) => (
  <View style={styles.container}>
    <Button
      onPress={requestPermissions}
      title={
        title !== null && title !== undefined
          ? title
          : Platform.OS === "web"
            ? "Location unavailable on web"
            : "Enable background location"
      }
      disabled={Platform.OS === "web"}
    />
  </View>
);

// This section defines the background location task.
if (Platform.OS !== "web") {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      return;
    }
    if (data) {
      const { locations } = data as { locations: Location.LocationObject[] };
      // do something with the locations captured in the background
      // This section logs the background locations.
      console.log(locations);
    }
  });
}
// This section defines the component styles.
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PermissionsButton;