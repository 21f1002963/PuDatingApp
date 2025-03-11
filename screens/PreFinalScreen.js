import { StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'


const PreFinalScreen = () => {
  return (
    <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? 200 : 0 , flex:1, backgroundColor: 'white'}}>
      <View>
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'GeezaPro-Bold',
          marginLeft: 20,
        }}>All set to register</Text>
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'GeezaPro-Bold',
          marginTop: 10,
          marginLeft: 20,
        }}>Setting up your profile for you.</Text>
      </View>
      <View>
        <LottieView
        style={{
          height: 250,
          width: 250,
          alignSelf: 'center',
          marginTop: 40,
          justifyContent: 'center',
        }}
        source= {require('../assets/love.json')}
        autoPlay
        loop={true}
        speed={0.7}
        />
      </View>
      <Pressable 
      style={{ backgroundColor: '#900C3F', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', padding: 15}}
      onPress={() => navigation.navigate('Name')}>
        <Text style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '600',
          fontFamily: 'GeezaPro',

        }}>Finish Registering</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default PreFinalScreen

const styles = StyleSheet.create({})