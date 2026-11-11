import * as Linking from 'expo-linking';
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from 'react-native';

/// WalkDetailsScreen component displays the details of a specific walk, 
// including its ID, date and time, starting coordinates, and tracking status.
const samplewalks = [samplewalk1(), samplewalk2()];
function samplewalk1() {
  return {
    id: 101,
    dateAndTime: 'October 1, 2026 at 10:00 AM',
    startingLatitude: 47.2529,
    startingLongitude: -122.4443,
    status: 'Completed',
  };
}
function samplewalk2() {
  return {
    id: 102,
    dateAndTime: 'October 2, 2026 at 11:00 AM',
    startingLatitude: 47.2530,
    startingLongitude: -122.4444,
    status: 'In Progress',
  };
}

export default function WalkDetailsScreen() {
  const [selectedId, setSelectedId] = useState(101);
  const [errorMessage, setErrorMessage] = useState('');
    const [mapError, setMapError] = useState('');
  useEffect(() => {
    let isMounted = true;
    const updateSelectedWalk = (url: string) => {
    const parsedUrl = Linking.parse(url);
    console.log('Received URL:', url);

    if (parsedUrl.scheme !== 'mywalks') {
  return;
}

if (parsedUrl.hostname !== 'walk') {
  setErrorMessage('This link cannot be opened by the Mobile Walking Tracker.');
  return;
}

    const walkId = parsedUrl.path?.split("/").filter(Boolean)[0];
      const id = Number(walkId);

    if (!walkId) {
      setErrorMessage('A walk ID is required.');
    } else if (!Number.isFinite(id) || !samplewalks.some((walk) => walk.id === id)) {
      setErrorMessage('Walk not found. Please check the walk ID.');
    } else {
      setSelectedId(id);
      setErrorMessage('');
    }
    };
    Linking.getInitialURL().then((url: string | null) => {
      if (isMounted && url) {
        updateSelectedWalk(url);
      }
    });

    const subscription = Linking.addEventListener("url", (event: { url: string }) => {
      updateSelectedWalk(event.url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
    const activeWalk = samplewalks.find((walk) => walk.id === selectedId);
const openGoogleMaps = async () => {
  if (!activeWalk) {
    return;
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${activeWalk.startingLatitude},${activeWalk.startingLongitude}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      setMapError('');
    } else {
      setMapError('Unable to open Google Maps.');
    }
  } catch {
    setMapError('Unable to open Google Maps.');
  }
};
const openStreetMap = async () => {
  if (!activeWalk) {
    return;
  }

  const url = `https://www.openstreetmap.org/?mlat=${activeWalk.startingLatitude}&mlon=${activeWalk.startingLongitude}#map=15/${activeWalk.startingLatitude}/${activeWalk.startingLongitude}`;

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
      setMapError('');
    } else {
      setMapError('Unable to open OpenStreetMap.');
    }
  } catch {
    setMapError('Unable to open OpenStreetMap.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk Details</Text>
      {errorMessage ? (
        <Text style={styles.walkNotFound}>{errorMessage}</Text>
      ) : activeWalk ? (
        <>
          <Text style={styles.walkId}>Walk ID: {activeWalk.id}</Text>
          <Text style={styles.dateAndTime}>Date and Time: {activeWalk.dateAndTime}</Text>
          <Text style={styles.startingLatitude}>Starting Latitude: {activeWalk.startingLatitude}</Text>
          <Text style={styles.startingLongitude}>Starting Longitude: {activeWalk.startingLongitude}</Text>
          <Text style={styles.status}>Status: {activeWalk.status}</Text>
          <Button title="Open Google Maps" onPress={openGoogleMaps} />
          <Button title="Open OpenStreetMap" onPress={openStreetMap} /> 
          {mapError ? <Text style={styles.mapError}>{mapError}</Text> : null}
        </>
      ) : (
        <Text style={styles.walkNotFound}>{errorMessage || 'Walk not found.'}</Text>
      )}
    </View>
  );
}

// Styles for the WalkDetailsScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Styles for the title text
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
    // Styles for the walk ID text
  walkId: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the date and time text
  dateAndTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the starting latitude text
  startingLatitude: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the starting longitude text
  startingLongitude: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the status text
  status: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the walk not found text
  walkNotFound: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  // Styles for the map error text
  mapError: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
});