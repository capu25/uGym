import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Audio } from 'expo-av';

const screen = Dimensions.get("window");

const formatNumber = number => `0${number}`.slice(-2);

const getRemaining = time => {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return { minutes: formatNumber(minutes), seconds: formatNumber(seconds) };
};

const createArray = length => {
  const arr = [];
  let i = 0;
  while (i < length) {
    arr.push(i.toString());
    i += 1;
  }
  return arr;
};

const AVAILABLE_MINUTES = createArray(16);
const AVAILABLE_SECONDS = createArray(60);

export default class App extends Component {
  state = {
    remainingSeconds: 5,
    isRunning: false,
    selectedMinutes: "1",
    selectedSeconds: "0",
    mode: "timer", // Stato per gestire modalità (timer o cronometro)
    elapsedSeconds: 0 // Stato per il cronometro
  };

  interval = null;
  sound = null;

  componentDidUpdate = (prevProp, prevState) => {
    const { remainingSeconds, mode } = this.state;
    if (mode === "timer" && remainingSeconds === 0 && prevState.remainingSeconds !== 0) {
      this.playSound();
      this.stop();
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3')
      );
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Errore nella riproduzione del suono:', error);
    }
  };

  start = () => {
    const { mode, selectedMinutes, selectedSeconds } = this.state;
    if (mode === "timer") {
      this.setState({
        remainingSeconds:
          parseInt(selectedMinutes, 10) * 60 +
          parseInt(selectedSeconds, 10),
        isRunning: true
      });
      this.interval = setInterval(() => {
        this.setState(state => ({
          remainingSeconds: state.remainingSeconds - 1
        }));
      }, 1000);
    } else if (mode === "stopwatch") {
      this.setState({ isRunning: true, elapsedSeconds: 0 });
      this.interval = setInterval(() => {
        this.setState(state => ({
          elapsedSeconds: state.elapsedSeconds + 1
        }));
      }, 1000);
    }
  };

  stop = () => {
    clearInterval(this.interval);
    this.interval = null;
    this.setState({
      isRunning: false,
      remainingSeconds: 5,
      elapsedSeconds: 0 // Resetta anche per il cronometro
    });
  };

  switchMode = () => {
    const { mode } = this.state;
    this.setState({ mode: mode === "timer" ? "stopwatch" : "timer" });
  };

  renderPickers = () => (
    <View style={styles.pickerContainer}>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={this.state.selectedMinutes}
        onValueChange={itemValue => {
          this.setState({ selectedMinutes: itemValue });
        }}
        mode="dropdown"
      >
        {AVAILABLE_MINUTES.map(value => (
          <Picker.Item key={value} label={value} value={value} />
        ))}
      </Picker>
      <Text style={styles.pickerItem}>Minuti</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={this.state.selectedSeconds}
        onValueChange={itemValue => {
          this.setState({ selectedSeconds: itemValue });
        }}
        mode="dropdown"
      >
        {AVAILABLE_SECONDS.map(value => (
          <Picker.Item key={value} label={value} value={value} />
        ))}
      </Picker>
      <Text style={styles.pickerItem}>Secondi</Text>
    </View>
  );

  render() {
    const { minutes, seconds } = getRemaining(this.state.remainingSeconds);
    const { elapsedSeconds, mode, isRunning } = this.state;
    const elapsedTime = getRemaining(elapsedSeconds);

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity onPress={this.switchMode} style={styles.switchButton}>
          <Text style={styles.switchButtonText}>
            {mode === "timer" ? "Passa al Cronometro" : "Passa al Timer"}
          </Text>
        </TouchableOpacity>

        {isRunning ? (
          mode === "timer" ? (
            <Text style={styles.timerText}>{`${minutes}:${seconds}`}</Text>
          ) : (
            <Text style={styles.timerText}>{`${elapsedTime.minutes}:${elapsedTime.seconds}`}</Text>
          )
        ) : mode === "timer" ? (
          this.renderPickers()
        ) : (
          <Text style={styles.timerText}>{`${elapsedTime.minutes}:${elapsedTime.seconds}`}</Text>
        )}

        {isRunning ? (
          <TouchableOpacity
            onPress={this.stop}
            style={[styles.button, styles.buttonStop]}
          >
            <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={this.start} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    borderWidth: 10,
    borderColor: "#edd136",
    width: screen.width / 2,
    height: screen.width / 2,
    borderRadius: screen.width / 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30
  },
  buttonStop: {
    borderColor: "red"
  },
  buttonText: {
    fontSize: 45,
    color: "#edd136"
  },
  buttonTextStop: {
    color: "red"
  },
  timerText: {
    color: "#fff",
    fontSize: 90
  },
  picker: {
    flex: 1,
    maxWidth: 100,
    ...Platform.select({
      android: {
        color: "#fff",
        backgroundColor: "rgba(92, 92, 92, 0.206)"
      }
    })
  },
  pickerItem: {
    color: "#fff",
    fontSize: 20,
    ...Platform.select({
      android: {
        marginLeft: 10,
        marginRight: 10
      }
    })
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  switchButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#edd136",
    borderRadius: 5
  },
  switchButtonText: {
    color: "#09090b",
    fontSize: 20
  }
});
