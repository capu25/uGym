import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const TrainingScreen = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [exercises, setExercises] = useState([]); // Stato per memorizzare gli esercizi

  const getCurrentDay = () => {
    const dayIndex = new Date().getDay(); // Ottiene l'indice del giorno corrente (0 = Domenica, 1 = Lunedì, ...)
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    
    const currentDay = dayNames[dayIndex]; // Ottiene il nome del giorno corrispondente
    return currentDay; // Restituisce il nome del giorno
  };

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

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
        <Text style={{fontSize: 18, fontWeight: '300'}}>Serie: {item.series}</Text>
        <Text style={{fontSize: 18, fontWeight: '300',}}>Peso: {item.weight} kg</Text>
        <Text style={{fontSize: 18, fontWeight: '300'}}>Giorno: {item.selectedDays.join(', ')}</Text>
        <View style={{ bottom: 25}}>
          <TouchableOpacity onPress={ () => {{color: 'green'}}}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <View>
        <Text>Allenamento del: {getCurrentDay()}</Text>
      </View>

      <View style={styles.content}>
        {exercises.length > 0 ? (
          <FlatList
            data={exercises}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderExercise}
          />
        ) : (
          <Text style={styles.noExercisesText}>Non ci sono esercizi aggiunti.</Text>
        )}
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
  noExercisesText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TrainingScreen;
