import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const TrainingScreen = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [exercises, setExercises] = useState([]); // Stato per memorizzare gli esercizi

  const loadUserData = async () => {
    try {
      // Carica i dati dell'utente
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      // Carica gli esercizi
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises)); // Imposta gli esercizi nello stato
      }
    } catch (error) {
      console.log('Errore nel caricamento dei dati', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const handleDeleteData = async () => {
    try {
      await AsyncStorage.clear(); // Cancella tutti i dati in AsyncStorage
      setUserData({ name: '' }); // Resetta lo stato locale
      setExercises([]); // Resetta la lista degli esercizi
      Alert.alert('Successo', 'Tutti i dati sono stati eliminati.');
    } catch (error) {
      console.log('Errore nella cancellazione dei dati', error);
      Alert.alert('Errore', 'Impossibile eliminare i dati.');
    }
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>Esercizio: {item.name}</Text>
      <Text>Serie: {item.series}</Text>
      <Text>Peso: {item.weight} kg</Text>
      <Text>Giorni: {item.selectedDays.join(', ')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {userData.name ? (
          <Text style={styles.welcomeText}>Welcome, {userData.name}!</Text>
        ) : (
          <Text style={styles.loadingText}>Loading user data...</Text>
        )}

        {exercises.length > 0 ? (
          <FlatList
            data={exercises}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderExercise}
          />
        ) : (
          <Text style={styles.noExercisesText}>Non ci sono esercizi aggiunti.</Text>
        )}

        <Button title="Elimina tutti i dati" onPress={handleDeleteData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  noExercisesText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TrainingScreen;
