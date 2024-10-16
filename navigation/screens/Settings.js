import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Switch, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Settings = () => {
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

  const navigation = useNavigation();

  // Ordine dei giorni della settimana
  const daysOrder = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Funzione per caricare gli esercizi da AsyncStorage
  const loadExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises));
      }
    } catch (error) {
      console.log('Errore nel caricamento degli esercizi', error);
    }
  };

  // Carica gli esercizi quando la schermata guadagna il focus
  useFocusEffect(
    React.useCallback(() => {
      loadExercises();
    }, [])
  );

  // Funzione per eliminare tutti i dati
  const handleClearAllData = async () => {
    Alert.alert(
      'Sei sicuro?',
      'Stai per eliminare tutti i dati, questa azione è irreversibile!',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('exercises');
              setExercises([]);
              Alert.alert('Successo', 'Tutti i dati sono stati eliminati!');
              navigation.navigate('EmptyData');
            } catch (error) {
              console.log('Errore nella cancellazione dei dati', error);
              Alert.alert('Errore', 'Impossibile eliminare i dati.');
            }
          },
        },
      ]
    );
  };

  // Funzione per l'aggiunta di esercizi
  const handleAddExec = () => {
    navigation.push("AddExercise");
  };

  // Funzione per eliminare un singolo esercizio
  const handleDeleteExercise = async (day, index) => {
    const updatedExercises = [...exercises];

    // Trova l'esercizio per il giorno specificato
    const dayExercises = groupExercisesByDay(updatedExercises)[day];
    const exerciseToDelete = dayExercises[index];

    // Trova l'indice dell'esercizio nell'array originale
    const exerciseIndexInOriginalArray = updatedExercises.findIndex(
      exercise => exercise.name === exerciseToDelete.name && exercise.selectedDays.includes(day)
    );

    if (exerciseIndexInOriginalArray !== -1) {
      updatedExercises.splice(exerciseIndexInOriginalArray, 1); // Rimuovi l'esercizio
      setExercises(updatedExercises); // Aggiorna lo stato

      // Aggiorna AsyncStorage
      await AsyncStorage.setItem('exercises', JSON.stringify(updatedExercises));

      Alert.alert('Esercizio eliminato', "L'esercizio è stato eliminato con successo.");
    } else {
      Alert.alert('Errore', 'Impossibile trovare l\'esercizio da eliminare.');
    }
  };

  // Funzione per raggruppare gli esercizi per giorno
  const groupExercisesByDay = (exercises) => {
    const grouped = {};
    exercises.forEach((exercise) => {
      exercise.selectedDays.forEach((day) => {
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(exercise);
      });
    });
    return grouped;
  };

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

  // Funzione per renderizzare ogni esercizio
  const renderExercise = ({ item, index, day }) => {
    return (
      <View style={styles.exerciseItem}>
        <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={styles.exerciseName}>{item.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center'}}>
            {/* Pulsante elimina */}
            <TouchableOpacity style={{ right: 10 }} onPress={() => handleDeleteExercise(day, index)}>
              <Icon name="trash-o" size={22} color={'red'} />
            </TouchableOpacity>
            {/* Pulsante modifica */}
            <TouchableOpacity style={{ left: 10 }}  onPress={() => openEditModal(item)}>
              <Icon name="pencil" size={22} color={'gray'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 10, backgroundColor: 'black'}}>
      <Text style={{ fontSize: 30, fontWeight: '300', marginBottom: 10, textAlign: 'center', color:'#edd136', top: 20 }}>Riepilogo Scheda:</Text>
      <View style={{ backgroundColor: '#f0f0f0', padding: 20, width: '100%', height: '89%',borderWidth: 2, borderColor: '#edd136', borderRadius: 9, top: 20}}>
        
        {/* Raggruppamento degli esercizi per giorno */}
        <FlatList
          data={daysOrder}
          keyExtractor={(day) => day}
          renderItem={({ item: day }) => {
            const exercisesForDay = groupExercisesByDay(exercises)[day] || [];
            return (
              <View key={day}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{day}</Text>
                <FlatList
                  data={exercisesForDay}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => renderExercise({ item, index, day })} // Passa il giorno corrente
                  ListEmptyComponent={<Text style={{ color: 'gray', fontStyle: 'italic', marginBottom: 10 }}>Nessun esercizio per questa giornata.</Text>}
                />
              </View>
            );
          }}
        />

        {/* Contenitore per i due bottoni */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, top: 10, height: 40, width: 350 }}>
          <TouchableOpacity style={[styles.actionBtn, {borderColor: 'black',backgroundColor: 'black'}]} onPress={handleAddExec}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
              <Icon name="plus-square-o" size={25} color={'#edd136'} style={{}}/>
              <Text style={{fontWeight: '300', left: 4, fontSize: 20, color: 'white'}}>Inserisci esercizio</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, {borderColor: 'black', backgroundColor: 'red', width: 100, right: 20}]} onPress={handleClearAllData}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
              <Text style={{fontWeight: '300', fontSize: 20, color: 'white'}}>Reset</Text>
              <Icon name="trash-o" size={23} color={'#fff'} style={{ left: 4 }}/>
            </View>
            
          </TouchableOpacity>

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '500',
  },
  actionBtn:{
    borderWidth: 1.5,
    borderColor: 'black',
    padding: 8,
    borderRadius: 8
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

export default Settings;
