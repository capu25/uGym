import { View, Text, Button } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingScreen = () => {

  const handleCompleteOnboarding = async () => {

    await AsyncStorage.setItem('hasLaunched', 'true');
    const HL = await AsyncStorage.getItem('hasLaunched');
    console.log(HL)
    
    navigation.replace('EmptyData');
  };
    
  return (
    <View style={{flex:1, alignContent: 'center', justifyContent: 'center'}}>
      <Text>Welcome to the App! This is the onboarding screen.</Text>
      <Button title="Get Started" onPress={handleCompleteOnboarding} />
    </View>
  )
}

export default OnboardingScreen