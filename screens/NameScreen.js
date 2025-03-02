import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { Image } from 'react-native'

const NameScreen = () => {
  const [firstName, setFirstName] = React.useState('')
  return (
    <SafeAreaView
      style={{ paddingTop: Platform.OS === 'android' ? 50 : 0, flex: 1, backgroundColor: 'white' }}>

      <Text style={{ marginTop: 50, textAlign: 'center', color: 'gray' }}
      >NO BACKGROUND CHECKS ARE CONDUCTED</Text>

      <View style={{ marginTop: 30, marginHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="newspaper-outline" size={26} color="black" />
          </View>
          <Image style={{ width: 100, height: 40 }}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10613/10613685.png'
            }}>
          </Image>
        </View>
        <View style={{ marginTop: 30 }}>
          <Text style={{
            fontSize: 25, fontWeight: 'bold', fontFamily: 'GeezaPro-Bold'
          }}> What's your name?
          </Text>
          <TextInput
          value={firstName} 
          onChangeText={ text => setFirstName(text)}
          autoFocus={true} placeholder='First Name (required)'
          placeholderTextColor={"#BEBEBE"}
          style={{
            width:340,
            // marginVertical: 10,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            fontFamily: 'GeezaPro-Bold',
            fontSize: firstName ? 22 : 22
          }}/> 
          <TextInput
          placeholder='Last Name'
          placeholderTextColor={"#BEBEBE"}
          style={{
            width:340,
            // marginVertical: 10,
            marginTop: 25,
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            paddingBottom: 10,
            fontFamily: 'GeezaPro-Bold',
            fontSize: firstName ? 22 : 22
          }}/>
          <Text style={{marginTop: 8 }}>Last name is optional</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default NameScreen

const styles = StyleSheet.create({})