import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Switch, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const TrainingScreen = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [exercises, setExercises] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [updatedExercise, setUpdatedExercise] = useState({
    name: '',
    series: '',
    weight: '',
    weights: [''], // Lista di pesi multipli
    reps: [''], // Lista di ripetizioni multiple
    recovery: '',
    useMultipleWeights: false, // Switch per pesi multipli
    useMultipleReps: false // Switch per ripetizioni multiple
  });

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
    setUpdatedExercise({
      ...exercise,
      weights: exercise.weights || [''],  // Assicura che 'weights' sia un array
      reps: exercise.reps || [''],        // Assicura che 'reps' sia un array
      useMultipleWeights: exercise.useMultipleWeights || false,
      useMultipleReps: exercise.useMultipleReps || false
    });
    setIsModalVisible(true);
  };
  

  const handleSave = async () => {
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
  
    setIsModalVisible(false);
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 5, padding: 10 }}>
        
        {/* Serie e Ripetizioni */}
        <View>
          <Text style={{ fontSize: 18, fontWeight: '500' }}>Serie: {item.series}</Text>
          
          {/* Gestione delle ripetizioni */}
          {item.useMultipleReps ? (
            <Text style={{ fontSize: 18, fontWeight: '300', marginTop: 10 }}>
              Ripetizioni: {item.reps.join(', ')}
            </Text>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '300', marginTop: 10 }}>Ripetizioni: {item.reps[0]}</Text> 
            // Qui usi il primo elemento dell'array
          )}
          
          {/* Gestione dei pesi */}
          {item.useMultipleWeights ? (
            <View style={{ marginTop: 10 }}>
              {item.weights.map((weight, index) => (
                <Text key={index} style={{ fontSize: 18, fontWeight: '300' }}>
                  Peso {index + 1}ª serie: {weight} Kg
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '300', marginTop: 10 }}>Peso: {item.weight} Kg</Text>
          )}
        </View>
  
        {/* Recupero */}
        <Text style={{ fontSize: 18, fontWeight: '500' }}>Recupero: {item.recovery}''</Text>
      </View>
  
      {/* Pulsante Modifica */}
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
            <View>
              <View style={{top: 60}}>
                <Text style={styles.noExercisesText}>Non ci sono esercizi per oggi.</Text>
                <Text style={{textAlign: 'center', fontSize: 25, fontWeight: '300'}}><Text style={{color:'#edd136', fontWeight: 500}}>Ben fatto</Text>, ricarica le batterie!</Text>
              </View>
              <LottieView
                source={require('../../assets/lottie/animationII.json')}
                autoPlay
                loop
                style={{width:'100%', height:'100%', bottom: 70}}
              />
            </View>
          )}
        </View>
      </View>

      {/* Modale per modificare l'esercizio */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifica esercizio</Text>

              {/* Switch per abilitare ripetizioni multiple */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Switch
                  value={updatedExercise.useMultipleReps}
                  onValueChange={value => {
                    // Se si abilita "useMultipleReps", converti reps in un array di ripetizioni per ogni serie
                    if (value) {
                      const newReps = Array.from({ length: parseInt(updatedExercise.series) || 1 }, () => updatedExercise.reps[0] || '');
                      setUpdatedExercise({ ...updatedExercise, useMultipleReps: true, reps: newReps });
                    } else {
                      // Se si disabilita, convertilo in una singola stringa
                      setUpdatedExercise({ ...updatedExercise, useMultipleReps: false, reps: [updatedExercise.reps[0] || ''] });
                    }
                  }}
                />
                <Text style={{ left: 5, fontSize: 15, fontWeight: '200' }}>
                  {updatedExercise.useMultipleReps ? 'Piramidale' : 'Piramidale'}
                </Text>
              </View>

              {/* Input per le ripetizioni */}
              {updatedExercise.useMultipleReps ? (
                updatedExercise.reps.map((rep, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    placeholder={`Ripetizione ${index + 1}`}
                    placeholderTextColor="#000"
                    value={rep}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const newReps = [...updatedExercise.reps];
                      newReps[index] = text;
                      setUpdatedExercise({ ...updatedExercise, reps: newReps });
                    }}
                  />
                ))
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Ripetizioni"
                  placeholderTextColor="#000"
                  value={updatedExercise.reps[0]}
                  keyboardType="numeric"
                  onChangeText={text => setUpdatedExercise({ ...updatedExercise, reps: [text] })}
                />
              )}

              {/* Bottone per aggiungere un'altra ripetizione */}
              {updatedExercise.useMultipleReps && (
                <Button
                  title="Aggiungi un'altra ripetizione"
                  onPress={() => setUpdatedExercise({ ...updatedExercise, reps: [...updatedExercise.reps, ''] })}
                />
              )}

              {/* Switch per abilitare pesi multipli */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <Switch
                  value={updatedExercise.useMultipleWeights}
                  onValueChange={value => setUpdatedExercise({ ...updatedExercise, useMultipleWeights: value })}
                />
                <Text style={{ left: 5, fontSize: 15, fontWeight: '200' }}>
                  {updatedExercise.useMultipleWeights ? 'Usa più pesi' : 'Usa più pesi'}
                </Text>
              </View>

              {/* Input per i pesi */}
              {updatedExercise.useMultipleWeights ? (
                updatedExercise.weights.map((weight, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    placeholder={`Peso ${index + 1} (kg)`}
                    placeholderTextColor="#000"
                    value={weight}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const newWeights = [...updatedExercise.weights];
                      newWeights[index] = text;
                      setUpdatedExercise({ ...updatedExercise, weights: newWeights });
                    }}
                  />
                ))
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg)"
                  placeholderTextColor="#000"
                  value={updatedExercise.weight}
                  keyboardType="numeric"
                  onChangeText={text => setUpdatedExercise({ ...updatedExercise, weight: text })}
                />
              )}

              {updatedExercise.useMultipleWeights && (
                <Button
                  title="Aggiungi un altro peso"
                  onPress={() => setUpdatedExercise({ ...updatedExercise, weights: [...updatedExercise.weights, ''] })}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Recupero (sec)"
                placeholderTextColor="#000"
                value={updatedExercise.recovery}
                keyboardType="numeric"
                onChangeText={text => setUpdatedExercise({ ...updatedExercise, recovery: text })}
              />

              <Button title="Salva" onPress={handleSave} />
              <Button title="Annulla" onPress={() => setIsModalVisible(false)} />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
    borderTopLeftRadius: 30,
  },
  content: {
    backgroundColor: '#fff',
    padding: 10,
    width: '95%',
    top: 10,
    height: 610
  },
  noExercisesText: {
    fontSize: 25,
    fontWeight: '400',
    textAlign: 'center',
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
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    placeholderTextColor: '#000'
  },
});

export default TrainingScreen;
