import React from 'react';
import { Button, Platform, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();


  console.log('foregroundStatus:', foregroundStatus);
  if (foregroundStatus !== 'granted') {
    return;
  }

  console.log(Platform.OS);
  if (Platform.OS === 'web') {
  }
  await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
    },
    (location) => {
      console.log('location:', location);
    }
  );
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    console.log('backgroundStatus:', backgroundStatus);
    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
  }
};

const PermissionsButton = () => (
  <View style={styles.container}>
    <Button
      onPress={requestPermissions}
      title={
        Platform.OS === 'web'
          ? 'Enable Foreground Location'
          : 'Enable Background Location'
      }
    />
  </View>
);

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }

  const taskData = data as { locations?: Location.LocationObject[] } | undefined;

  if (taskData?.locations) {
    const { locations } = taskData;
    // do something with the locations captured in the background
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PermissionsButton;