import { StyleSheet, Text, View } from 'react-native';
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
  const selectedId = 101;
  const activeWalk = samplewalks.find((walk) => walk.id === selectedId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Walk Details</Text>
      {activeWalk ? (
        <>
          <Text style={styles.walkId}>Walk ID: {activeWalk.id}</Text>
          <Text style={styles.dateAndTime}>Date and Time: {activeWalk.dateAndTime}</Text>
          <Text style={styles.startingLatitude}>Starting Latitude: {activeWalk.startingLatitude}</Text>
          <Text style={styles.startingLongitude}>Starting Longitude: {activeWalk.startingLongitude}</Text>
          <Text style={styles.status}>Status: {activeWalk.status}</Text>
        </>
      ) : (
        <Text style={styles.walkNotFound}>Walk not found.</Text>
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
});