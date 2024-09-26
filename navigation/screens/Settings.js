import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert, Modal, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [userData, setUserData] = useState({ name: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [exercises, setExercises] = useState([]); // Stato per gli esercizi
  const [selectedExercise, setSelectedExercise] = useState(null); // Esercizio selezionato per modifica

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }

        const storedExercises = await AsyncStorage.getItem('exercises');
        if (storedExercises) {
          setExercises(JSON.parse(storedExercises)); // Carica gli esercizi
        }
      } catch (error) {
        console.log('Errore nel caricamento dei dati', error);
      }
    };

    loadUserData();
  }, []);

  const handleSaveData = async () => {
    try {
      // Salva i dati utente
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Salva gli esercizi aggiornati
      await AsyncStorage.setItem('exercises', JSON.stringify(exercises));
      
      Alert.alert('Successo', 'Dati salvati con successo!');
      setModalVisible(false);
    } catch (error) {
      console.log('Errore nel salvataggio dei dati', error);
      Alert.alert('Errore', 'Impossibile salvare i dati.');
    }
  };

  const handleInputChange = (value) => {
    setUserData({ ...userData, name: value });
  };

  const handleExerciseChange = (field, value) => {
    if (selectedExercise) {
      setSelectedExercise({ ...selectedExercise, [field]: value });
    }
  };

  const saveExercise = () => {
    // Aggiorna l'elenco degli esercizi
    const updatedExercises = exercises.map(ex => ex.name === selectedExercise.name ? selectedExercise : ex);
    setExercises(updatedExercises);
    setSelectedExercise(null); // Resetta l'esercizio selezionato
    setModalVisible(false);
  };

  const openEditExerciseModal = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const renderExercise = ({ item }) => (
    <TouchableOpacity onPress={() => openEditExerciseModal(item)}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
        <Text>Esercizio: {item.name}</Text>
        <Text>Serie: {item.series}</Text>
        <Text>Peso: {item.weight} kg</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#09090b' }}>
      <View style={{ backgroundColor: '#fff', padding: 20, width: '100%' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Modifica i tuoi dati</Text>
        <TextInput
          value={userData.name}
          onChangeText={handleInputChange}
          placeholder="Inserisci il tuo nome"
          style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        />

        <Text style={{ fontSize: 18, marginBottom: 10 }}>Esercizi:</Text>
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderExercise}
        />

        <Button title="Salva Dati" onPress={handleSaveData} />
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
            <Text>Modifica l'esercizio:</Text>
            {selectedExercise && (
              <>
                <TextInput
                  value={selectedExercise.name}
                  onChangeText={(value) => handleExerciseChange('name', value)}
                  placeholder="Nome esercizio"
                  style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />
                <TextInput
                  value={selectedExercise.series.toString()}
                  onChangeText={(value) => handleExerciseChange('series', value)}
                  placeholder="Numero di serie"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />
                <TextInput
                  value={selectedExercise.weight.toString()}
                  onChangeText={(value) => handleExerciseChange('weight', value)}
                  placeholder="Peso (kg)"
                  keyboardType="numeric"
                  style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />
                <Button title="Salva Esercizio" onPress={saveExercise} />
              </>
            )}
            <Button title="Chiudi" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Settings;
