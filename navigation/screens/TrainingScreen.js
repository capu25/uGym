import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const TrainingScreen = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [exercises, setExercises] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [updatedExercise, setUpdatedExercise] = useState({ name: '', series: '', weight: '', recovery: '' });

  const giorniDellaSettimana = {
    Lun: 'Lunedì',
    Mar: 'Martedì',
    Mer: 'Mercoledì',
    Gio: 'Giovedì',
    Ven: 'Venerdì',
    Sab: 'Sabato',
    Dom: 'Domenica'
  };

  const getCurrentDay = () => {
    const dayIndex = new Date().getDay();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const currentDay = dayNames[dayIndex];
    return currentDay;
  };

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        const allExercises = JSON.parse(storedExercises);
        const currentDay = getCurrentDay();
        const filteredExercises = allExercises.filter(exercise =>
          exercise.selectedDays.includes(currentDay)
        );
        setExercises(filteredExercises);
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

  const openEditModal = (exercise) => {
    setSelectedExercise(exercise);
    setUpdatedExercise({ ...exercise });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    // Aggiorna l'esercizio nella lista
    const updatedExercises = exercises.map(exercise => 
      exercise.name === selectedExercise.name ? updatedExercise : exercise
    );
    setExercises(updatedExercises);

    // Salva in AsyncStorage
    try {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        const allExercises = JSON.parse(storedExercises);
        const newAllExercises = allExercises.map(exercise =>
          exercise.name === selectedExercise.name ? updatedExercise : exercise
        );
        await AsyncStorage.setItem('exercises', JSON.stringify(newAllExercises));
      }
    } catch (error) {
      console.log('Errore nel salvataggio dei dati', error);
    }

    // Chiudi la modale
    setIsModalVisible(false);
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: '300' }}>Serie: {item.series}</Text>
        <Text style={{ fontSize: 18, fontWeight: '300' }}>Peso: {item.weight} kg</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: '300' }}>Recupero: {item.recovery} sec</Text>
      </View>
      {/* Bottone per modificare */}
      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
        <Text style={styles.editButtonText}>Modifica</Text>
      </TouchableOpacity>
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
            <View style={{borderWidth: 1, borderColor: 'red'}}>
              <Text style={styles.noExercisesText}>Non ci sono esercizi per oggi.</Text>
            </View>
          )}
        </View>
      </View>

      {/* Modale per modificare l'esercizio */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifica esercizio</Text>
            <TextInput
              style={styles.input}
              placeholder="Serie"
              value={updatedExercise.series}
              keyboardType="numeric"
              onChangeText={text => setUpdatedExercise({ ...updatedExercise, series: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Peso (kg)"
              value={updatedExercise.weight}
              keyboardType="numeric"
              onChangeText={text => setUpdatedExercise({ ...updatedExercise, weight: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Recupero (sec)"
              value={updatedExercise.recovery}
              keyboardType="numeric"
              onChangeText={text => setUpdatedExercise({ ...updatedExercise, recovery: text })}
            />
            <Button title="Salva" onPress={handleSave} />
            <Button title="Annulla" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#09090b'
  },
  headerTextBox: {
    marginTop: 70,
    marginBottom: 20
  },
  headerText: {
    fontSize: 30,
    fontWeight: '400',
    color: '#fff'
  },
  contentContaine: {
    width: '100%',
    height: '100%',
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
  editButton: {
    marginTop: 10,
    backgroundColor: '#edd136',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default TrainingScreen;
