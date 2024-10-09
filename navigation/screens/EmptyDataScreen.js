import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Dimensions, Vibration, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Counter from 'react-native-counters';

const EmptyDataScreen = ({ navigation }) => {

  const screenWidth = Dimensions.get('window').width;

  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [series, setSeries] = useState(0);
  const [weight, setWeight] = useState(0);
  const [recovery, setRecovery] = useState('');
  const [exercises, setExercises] = useState([]);

  const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddExercise = async () => {
    if (name.trim() && recovery.trim()) { 
      const newExercise = { name, selectedDays, series, weight, recovery }; 
      setExercises([...exercises, newExercise]);
      await AsyncStorage.setItem('exercises', JSON.stringify([...exercises, newExercise]));
      setName('');
      setSelectedDays([]);
      setSeries(0);
      setWeight(0);
      setRecovery('');
      Toast.show({
        type: 'success',
        text1: 'Ben fatto!',
        text2: 'Esercizio aggiunto con successo 💪'
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Attenzione!',
        text2: 'Non hai compilato tutti i campi.'
      });
      Vibration.vibrate();
    }
  };

  const handleInfo = () => {
    Alert.alert("Serie e Peso", "Gli esercizi con modalità 'PIRAMIDALE' possono essere impostati in seguito. Inserisci un peso 'base' se necessiti una modifica di fino.");
  }

  const handleSaveData = async () => {
    if (exercises.length > 0) {
      await AsyncStorage.setItem('exercises', JSON.stringify(exercises));
      await AsyncStorage.setItem('hasCompletedData', 'true');
      navigation.replace('MainTabs');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Attenzione!',
        text2: 'Non hai aggiunto nessun esercizio.'
      });
      Vibration.vibrate();
    }
  };

  const DayButton = ({ day, isSelected, onPress }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, isSelected ? styles.selectedButton : styles.defaultButton]}
      >
        <Text style={styles.text}>{day}</Text>
      </TouchableOpacity>
    );
  };

  return (
    // Avvolgi tutto in un TouchableWithoutFeedback per far collassare la tastiera quando si tocca fuori
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image
            source={require('../../assets/ugymLogo.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.whiteContainer, { width: screenWidth }]}>
          <Text style={styles.headerText}>Inserisci gli esercizi presenti nella scheda!</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome esercizio"
            style={styles.inputBox}
            onSubmitEditing={Keyboard.dismiss} // Nascondi la tastiera al termine dell'inserimento
          />

          <View style={styles.counters}>
            <Counter
              start={series}
              max={20}
              onChange={(count) => setSeries(count)}
              buttonStyle={{
                borderColor: '#333',
                borderWidth: 2,
                height: 50,
                width: 50,
              }}
              buttonTextStyle={{
                color: '#edd166',
                fontSize: 40,
                fontWeight: 300,
                bottom: 3
              }}
              countTextStyle={{
                color: '#333',
                fontSize: 20,
                fontWeight: 'bold'
              }}
            />
            <Counter
              start={weight}
              max={200}
              increment={5}
              onChange={(count) => setWeight(count)}
              buttonStyle={{
                borderColor: '#333',
                borderWidth: 2,
                height: 50,
                width: 50,
              }}
              buttonTextStyle={{
                color: '#edd166',
                fontSize: 40,
                fontWeight: 300,
                bottom: 3
              }}
              countTextStyle={{
                color: '#333',
                fontSize: 20,
                fontWeight: 'bold'
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', bottom: 20, width: 280, left: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>N° Serie</Text>
            <TouchableOpacity onPress={handleInfo} style={{ borderWidth: 1, borderColor: '#edd166', borderRadius: 50, width: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '400' }}>i</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>Peso (KGs)</Text>
          </View>

          {/* Campo per il recupero */}
          <TextInput
            value={recovery}
            onChangeText={setRecovery}
            placeholder="Recupero (in secondi)"
            style={styles.inputBoxII}
            keyboardType="numeric"
            onSubmitEditing={Keyboard.dismiss} // Nascondi la tastiera al termine dell'inserimento
          />

          <Text style={styles.headerTextII}>Seleziona a quale giorno appartiene.</Text>

          <View style={styles.dayContainer}>
            {days.map((day, index) => (
              <DayButton
                key={index}
                day={day}
                isSelected={selectedDays.includes(day)}
                onPress={() => toggleDay(day)}
              />
            ))}
          </View>

          <View style={styles.addText}>
            <Image
              source={require('../../assets/add.png')}
              style={{ height: 40, width: 60 }}
              resizeMode="contain"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.finishedButton} onPress={handleSaveData}>
              <Text style={styles.finishedButtonText}>Ho finito!</Text>
            </TouchableOpacity>

            <View style={styles.addButtonContainer}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
                <AntDesign name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        <Toast text1Style={{ fontSize: 15 }} text2Style={{ fontSize: 15 }} />
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  logo: {
    top: 30,
  },
  image: {
    width: 250,
    height: 80,
  },
  whiteContainer: {
    backgroundColor: '#fff',
    height: 700,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignContent: 'center',
    alignItems: 'center',
    padding: 30,
    top: 50
  },
  headerText: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '300',
  },
  headerTextII: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '300',
    top: 10
  },
  inputBox: {
    borderWidth: 3,
    padding: 10,
    marginVertical: 20,
    width: 350,
    height: 50,
    borderRadius: 9,
  },
  inputBoxII:{
    borderWidth: 2,
    padding: 5,
    borderRadius: 9,
    borderColor: '#000',
    width: 156
  },
  // COUNTERS
  counters: {
    height: 100,
    width: 350,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  // BOTTONI SELEZIONE GIORNATA
  dayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: 30,
    width: 350,
  },
  button: {
    margin: 10,
    borderWidth: 2,
    borderRadius: 20,
    padding: 10,
    width: 90,
    alignItems: 'center',
  },
  defaultButton: {
    borderColor: 'black',
    backgroundColor: 'white',
  },
  selectedButton: {
    borderColor: 'black',
    backgroundColor: '#edd136',
  },
  text: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
  // AGGIUNGI CURVO SU + 
  addText:{
    alignSelf: 'flex-end',
    left: 5
  },
  // BOTTONI A FINE PAGINA
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    bottom: 20,
  },
  finishedButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 90,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#edd136',
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    borderRightWidth: 5,
    borderRightColor: '#edd136',
    marginHorizontal: 20
  },
  finishedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addButtonContainer: {
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#edd136'
  },
});

export default EmptyDataScreen;
