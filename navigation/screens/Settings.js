import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const [exercises, setExercises] = useState([]); // Stato per gli esercizi esistenti
  const navigation = useNavigation();

  // Carica gli esercizi salvati all'avvio del componente
  useEffect(() => {
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
    loadExercises();
  }, []);

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

  // Funzione per renderizzare ogni esercizio nella lista
  const renderExercise = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
      <Text>{item.name}</Text>
      {/* Assicurati di avvolgere il rendering dei giorni in un componente Text */}
      <Text>Giorni: {item.selectedDays ? item.selectedDays.join(', ') : 'Nessun giorno selezionato'}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#fff', padding: 20, width: '100%' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Esercizi:</Text>

        {/* Lista di tutti gli esercizi */}
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderExercise}
          ListEmptyComponent={<Text>Nessun esercizio disponibile.</Text>} // Componente vuoto da visualizzare quando non ci sono esercizi
        />

        {/* Pulsante per eliminare tutti i dati */}
        <Button
          title="Elimina Tutti i Dati"
          onPress={handleClearAllData}
          color="red"
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
};

export default Settings;
