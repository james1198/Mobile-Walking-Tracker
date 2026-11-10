import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Button, Platform, StyleSheet, View } from "react-native";
// This section defines the background location task name.
const LOCATION_TASK_NAME = "background-location-task";
// This section defines the permission request function.
const requestPermissions = async () => {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  // This section logs the foreground permission status.
  console.log("foregroundStatus", foregroundStatus);
  // This section stops the permission request if foreground permissions are not granted.
  if (foregroundStatus !== "granted") {
    return;
  }

  // This section handles browser permissions.
  console.log("current platform", Platform.OS);
  if (Platform.OS === "web") {
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
      },
      // This section logs the foreground location.
      (location) => {
        console.log("foreground location", location);
      },
    );
    // This section stops the permission request for web.
    return;
  } else {
    if (foregroundStatus === "granted") {
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
    }
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
          : `Enable ${Platform.OS === "web" ? "foreground" : "background"} location`
      }
    />
  </View>
);

// This section defines the background location task.
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
// This section defines the component styles.
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PermissionsButton;