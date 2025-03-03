import { StyleSheet, Text, View, SafeAreaView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { useRoute } from '@react-navigation/native';

const OtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef([]);
  const route = useRoute();
  const navigation = useNavigation();
  const email = route?.params?.email;

  const handleConfirmSignUp = () => {
    navigation.navigate('Birth')
  }

  useEffect(()=>{
    if(otp.every(digit=> digit !== '')){
      handleConfirmSignUp()
    }
  }, [otp])

  const handleChange = (text, index) => {
    const newOtp = [...otp]
    newOtp[index] = text;
    setOtp(newOtp)

    if(text && index < 5){
      inputs.current[index+1].focus();
    }
  }

  const handleBackspace = (text, index) => {
    if(!text && index > 0){
      inputs.current[index-1].focus();
    }
    const newOtp = [...otp]
    newOtp[index] = text;
    setOtp(newOtp)
  }

  return (
    <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? 50 : 0, flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
      <View style = {{
        height: 60,
        justifyContent:'center',
        alignItems:'center',
        marginTop:50
      }}>
        <Text style={{
          fontSize: 18, 
          fontWeight: '500'
        }}>Verification code</Text>
        <Text style={{
          fontSize: 14,
          color: 'gray',
          marginTop: 5
        }}>Enter the 6 digit code sent to your email</Text>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 30
      }}>
        {otp?.map((_, index) => (
          <TextInput
          key={index}
          ref = {el => (inputs.current[index] = el)}
          keyboardType="number-pad"
          style={{
            width: 45,
            height: 45,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 18,
            color: '#333'

          }}
          maxLength={1}
          value={otp[index]}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={({nativeEvent}) => {
            if(nativeEvent.key == "BackSpace"){
              handleBackspace("", index)
            }
          }}
          autoFocus={index===0}>
          </TextInput>
        ))}
      </View>

    </SafeAreaView>
  )
}

export default OtpScreen

const styles = StyleSheet.create({})