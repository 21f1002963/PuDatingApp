import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'
// import { GOOGLE_MAPS_API_KEY } from '@env'
import Geolocation from '@react-native-community/geolocation'
import { Alert } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { Image } from 'react-native'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'


const LocationScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = React.useState('')
  const [location, setLocation] = React.useState('Loading...')
  useEffect(() => {
    Geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords

      const initailRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      } 

      setRegion(initailRegion)

      fetchAddress(latitude, longitude)
    }, error => Alert.alert('Error', JSON.stringify(error)), {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000
  }, [])})

  const fetchAddress = async (latitude, longitude) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCq90w_WLGGYgj2oRwsw9JtymqJJqfavJ0`)
    const data = await response.json()
    if(data.results.length > 0){
      const addressComponents = data.results[0].address_components
      let formatted_address = ''
      for(let i = 0; i < addressComponents.length; i++){
        if(component.types.includes('sublocality_level_1')){
          formatted_address += addressComponents[i].long_name + ', '
        }
        if(component.types.includes('locality')){
          formatted_address += addressComponents[i].long_name + ', '
        }
      }
      formatted_address = formatted_address.trim().slice(0, -1)
      setLocation(formatted_address)
    }
    setLocation(data.results[0].formatted_address)
  }

  const handleNext = () => {
    navigation.navigate('Gender')
  }

  return (
    <SafeAreaView style={{ paddingTop: Platform.OS === 'android' ? 50 : 0, flex: 1, backgroundColor: 'white' }}>
      <View style={{ marginTop: 30, marginHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <MaterialDesignIcons name="map-marker" size={26} color="black" />

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
          }}> Where do you live?
          </Text>

          <MapView
          region={region}
          style={{ width: '100%', height: 500, marginTop: 20, borderRadius: 5 }}>
            { region && (
              <Marker coordinate={{
                latitude: region.latitude,
                longitude: region.longitude
              }}>
                <View style={{ backgroundColor: 'black', padding: 12, borderRadius: 30 }}>
                  <Text style={{ color: 'white', fontWeight: '500',
                    fontSize: 14, fontFamily: 'GeezaPro-Bold', textAlign: 'center'
                   }}>
                    {location}
                  </Text>
                </View>
              </Marker>
            )}
          </MapView>

          <TouchableOpacity
            onPress={handleNext}
            style={{ marginTop: 30, marginLeft: 'auto' }}>
            <Ionicons name="chevron-forward-circle-outline" size={45} color="#581845" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LocationScreen

const styles = StyleSheet.create({})