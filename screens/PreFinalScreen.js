import { StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../AuthContext'
import { set } from 'core-js/core/dict'


const PreFinalScreen = () => {
  const [userData, setUserData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const { token, setToken } = React.useContext(AuthContext)
  const navigation = useNavigation()
  useEffect(() => {
    getALlUserData()
  }, [])

  const clearAllScreenData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Workplace',
        'JobTitle',
        'Photos',
        'Prompts',
      ];

      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }

      console.log('All screen data cleared!');
    } catch (error) {
      console.log('Error', error);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${BASE_URL}/register`, userData).then((response) => {
        const token = response.data.token
        setToken(token)
      })
      clearAllScreenData()
    }
    catch(error) {
      console.log("Error", error)
  }finally{
    setLoading(false);
  }
  }

  const getALlUserData = async () => {
    try {
      const screens = [
        'Name',
        'Email',
        'Password',
        'Birth',
        'Location',
        'Gender',
        'Type',
        'Dating',
        'LookingFor',
        'Hometown',
        'Workplace',
        'JobTitle',
        'Photos',
        'Prompts',
      ]; 
      let userData = {};
      for(const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName)
        if(screenData){
          userData = {...userData, ...screenData}
        }
      }

      setUserData(userData)
      console.log(user)
    } catch (error) {
      console.log(error)
    }
  }

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
      onPress={registerUser}
      style={{ backgroundColor: '#900C3F', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', padding: 15}}>
        {loading ? (<ActivityIndicator size='small' color='white' />) :(
        <Text style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '600',
          fontFamily: 'GeezaPro',

        }}>Finish Registering</Text>)}
      </Pressable>
    </SafeAreaView>
  )
}

export default PreFinalScreen

const styles = StyleSheet.create({})