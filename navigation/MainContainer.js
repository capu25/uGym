import React, { useEffect, useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// --- IMPORT SCREENS ---
import EmptyDataScreen from './screens/EmptyDataScreen';
import TrainingScreen from './screens/TrainingScreen';
import Settings from './screens/Settings';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator with Main and Settings
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#edd136',
        tabBarInactiveTintColor: '#a6a6a6',
        tabBarLabelStyle: {
          fontSize: 15,
          textAlign: 'center',
          bottom: 10
        },
        tabBarStyle : {
          backgroundColor: "#09090b",
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          height: 120
        }
      }}
    >
      <Tab.Screen 
        name="Workout" 
        component={TrainingScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="user" size={40} color={color} style={{}}/>
          ),
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings} 
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="cog" size={40} color={color} style={{}}/>
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

const MainContainer = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');

        if (hasLaunched === null) {
          // Prima apertura, mostra onboarding
          await AsyncStorage.setItem('hasLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          // L'onboarding è già stato fatto
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.log('Errore nel controllo del lancio', error);
      }
    };

    checkFirstLaunch();
  }, []);

  // Schermata di caricamento o null durante il controllo iniziale
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isFirstLaunch ? 'EmptyData' : 'MainTabs'}
        screenOptions={{ headerShown: false }}
      >
        {/*<Stack.Screen name="Onboarding" component={OnboardingScreen} />*/}
        <Stack.Screen name="EmptyData" component={EmptyDataScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainContainer;