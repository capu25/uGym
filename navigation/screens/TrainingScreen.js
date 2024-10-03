import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const TrainingScreen = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [exercises, setExercises] = useState([]); // Stato per memorizzare gli esercizi

  const giorniDellaSettimana = {
    Lun: 'Lunedì',
    Mar: 'Martedì',
    Mer: 'Mercoledì',
    Gio: 'Giovedì',
    Ven: 'Venerdì',
    Sab: 'Sabato',
    Dom: 'Domenica'
  };

  // Restituisce il giorno corrente in formato abbreviato
  const getCurrentDay = () => {
    const dayIndex = new Date().getDay(); // Ottiene l'indice del giorno corrente (0 = Domenica, 1 = Lunedì, ...)
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    
    const currentDay = dayNames[dayIndex]; // Ottiene il nome abbreviato del giorno corrispondente
    
    return currentDay;
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
        const allExercises = JSON.parse(storedExercises);

        // Filtra gli esercizi per il giorno corrente
        const currentDay = getCurrentDay();
        const filteredExercises = allExercises.filter(exercise =>
          exercise.selectedDays.includes(currentDay) // Controlla se il giorno corrente è tra i giorni selezionati
        );

        setExercises(filteredExercises); // Imposta gli esercizi filtrati nello stato
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
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5}}>
        <Text style={{fontSize: 18, fontWeight: '300'}}>Serie: {item.series}</Text>
        <Text style={{fontSize: 18, fontWeight: '300',}}>Peso: {item.weight} kg</Text>
        {/*<Text style={{fontSize: 18, fontWeight: '300'}}>Giorno: {item.selectedDays.join(', ')}</Text>*/}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.headerTextBox}>
        <Text style={styles.headerText}>
          Allenamento del <Text style={{ color: '#edd136' }}>
            {giorniDellaSettimana[getCurrentDay()] || ''}
          </Text>
        </Text>
      </View>

      <View style={styles.contentContaine}>
        <View style={styles.content}>
          {exercises.length > 0 ? (
            <FlatList
              data={exercises}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderExercise}
            />
          ) : (
            <Text style={styles.noExercisesText}>Non ci sono esercizi per oggi.</Text>
          )}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    backgroundColor: '#09090b'
  },
  headerTextBox:{
    marginTop: 70,
    marginBottom: 20
  },
  headerText: {
    fontSize: 30,
    fontWeight: '400',
    color: '#fff'
  },
  contentContaine:{
    width: '100%',
    height:'100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    width: '95%',
    top: 10
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
