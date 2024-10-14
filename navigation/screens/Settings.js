import React, { act, useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Modifica qui

const Settings = () => {

  const [exercises, setExercises] = useState([]); // Stato per gli esercizi esistenti
  const navigation = useNavigation();

  // Definisci l'ordine dei giorni della settimana
  const daysOrder = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Carica gli esercizi salvati all'avvio del componente
  const loadExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises)); // Carica gli esercizi se presenti
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

  // Funzione per l'aggiunta di esercizio singolo
  const handleAddExec = () => {
    navigation.push("AddExercise");
  };

  // Funzione per eliminare un singolo esercizio
  const handleDeleteExercise = async (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
    await AsyncStorage.setItem('exercises', JSON.stringify(updatedExercises)); // Aggiorna AsyncStorage
    Alert.alert('Esercizio eliminato', 'L\'esercizio è stato eliminato con successo.');
  };

  // Funzione per ordinare i giorni selezionati secondo daysOrder
  const sortDays = (days) => {
    return days.slice().sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
  };

  // Funzione per renderizzare ogni esercizio nella lista
  const renderExercise = ({ item, index }) => {
    const sortedDays = item.selectedDays ? sortDays(item.selectedDays) : [];
    return (
      <View style={styles.exerciseItem}>
        <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={{fontSize: 18, fontWeight: '200'}}>Giorni: <Text style={{fontWeight: 'bold'}}>{sortedDays.length > 0 ? sortedDays.join(', ') : 'Nessun giorno selezionato'}</Text></Text>
          </View>
          {/* Pulsanti Modifica e Elimina */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => handleDeleteExercise(index)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Elimina</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 10, backgroundColor: 'black'}}>
      <Text style={{ fontSize: 30, fontWeight: '300', marginBottom: 10, textAlign: 'center', color:'#edd136', top: 20 }}>Riepilogo Scheda:</Text>
      <View style={{ backgroundColor: '#f0f0f0', padding: 20, width: '100%', height: '85%',borderWidth: 2, borderColor: '#edd136', borderRadius: 9, top: 20}}>
        {/* Lista di tutti gli esercizi */}
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderExercise}
          ListEmptyComponent={<View style={{alignItems: 'center', marginTop: '60%'}}>
                                <Text style={{fontSize: 25, textAlign: 'center', marginBottom: 20}}>OOPS... qualcosa non va!</Text>
                                <Text style={{fontSize: 25, textAlign: 'center'}}>Nessun esercizio disponibile.</Text>
                                <Text style={{fontSize: 18, textAlign: 'center', marginTop: 20}}>Per inserire nuovi esercizi, premi <Text style={{color:'red'}}>"INSERISCI NUOVA SCHEDA"</Text> e segui la procedura indicata.</Text>
                              </View>} // Componente vuoto da visualizzare quando non ci sono esercizi
        />

        {/* Contenitore per i due bottoni */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, top: 10 }}>
          <TouchableOpacity style={[styles.actionBtn, {borderColor: 'lightgreen', backgroundColor: 'lightgreen'}]} onPress={handleAddExec}>
            <Text style={[styles.actionBtnTxt, {color: 'black'}]}>Inserisci Esercizio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, {borderColor: 'red', backgroundColor: 'red'}]} onPress={handleClearAllData}>
            <Text style={[styles.actionBtnTxt, {color: 'white'}]}>Nuova Scheda</Text>
          </TouchableOpacity>
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
  modifyButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionBtn:{
    borderWidth: 1.5,
    borderColor: 'black',
    padding: 8,
    borderRadius: 8
  },
  actionBtnTxt:{
    fontSize: 16,
    fontWeight: '300'
  }
});

export default Settings;
