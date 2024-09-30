import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const Settings = () => {
  const [exercises, setExercises] = useState([]); // Stato per gli esercizi
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null); // Esercizio selezionato per modifica
  const [fieldToEdit, setFieldToEdit] = useState(null); // Campo da modificare ('weight' o 'series')

  // Carica i dati salvati alla partenza
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const storedExercises = await AsyncStorage.getItem('exercises');
        if (storedExercises) {
          setExercises(JSON.parse(storedExercises)); // Carica gli esercizi
        }
      } catch (error) {
        console.log('Errore nel caricamento degli esercizi', error);
      }
    };
    loadExercises();
  }, []);

  // Salva gli esercizi aggiornati
  const handleSaveData = async () => {
    try {
      await AsyncStorage.setItem('exercises', JSON.stringify(exercises));
      Alert.alert('Successo', 'Esercizi salvati con successo!');
      setModalVisible(false);
    } catch (error) {
      console.log('Errore nel salvataggio degli esercizi', error);
      Alert.alert('Errore', 'Impossibile salvare gli esercizi.');
    }
  };

  // Funzione per modificare l'esercizio selezionato
  const handleExerciseChange = (value) => {
    if (selectedExercise && fieldToEdit) {
      const updatedExercise = { ...selectedExercise, [fieldToEdit]: value };
      setSelectedExercise(updatedExercise);
    }
  };

  const saveExercise = () => {
    // Aggiorna l'elenco degli esercizi
    const updatedExercises = exercises.map(ex =>
      ex.name === selectedExercise.name ? selectedExercise : ex
    );
    setExercises(updatedExercises);
    setSelectedExercise(null);
    setModalVisible(false);
  };

  const openEditExerciseModal = (exercise, field) => {
    setSelectedExercise(exercise);
    setFieldToEdit(field);
    setModalVisible(true);
  };

  const navigation = useNavigation();
  
  // Funzione per eliminare tutti i dati
  const handleClearAllData = async () => {
    Alert.alert(
      'Conferma',
      'Sei sicuro di voler eliminare tutti i dati? Questa azione è irreversibile!',
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
              // Cancella gli esercizi da AsyncStorage
              await AsyncStorage.removeItem('exercises');
              // Resetta lo stato locale degli esercizi
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

  const renderExercise = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text>{item.name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => openEditExerciseModal(item, 'series')}
        >
          <Text style={{ color: 'blue' }}>Modifica Serie</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEditExerciseModal(item, 'weight')}>
          <Text style={{ color: 'green' }}>Modifica Peso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#fff', padding: 20, width: '100%' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Esercizi:</Text>
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderExercise}
        />
        <Button title="Salva Esercizi" onPress={handleSaveData} />

        {/* Pulsante per eliminare tutti i dati */}
        <Button
          title="Elimina Tutti i Dati"
          onPress={handleClearAllData}
          color="red"
          style={{ marginTop: 20 }}
        />
      </View>

      {/* Modale per modificare l'esercizio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
            <Text>{fieldToEdit === 'series' ? 'Modifica Serie' : 'Modifica Peso'} per {selectedExercise?.name}</Text>
            {selectedExercise && (
              <TextInput
                value={selectedExercise[fieldToEdit].toString()}
                onChangeText={(value) => handleExerciseChange(value)}
                placeholder={fieldToEdit === 'series' ? 'Numero di serie' : 'Peso (kg)'}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
              />
            )}
            <Button title="Salva Modifica" onPress={saveExercise} />
            <Button title="Chiudi" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;
