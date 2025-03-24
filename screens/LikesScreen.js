import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useContext } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native'

const LikesScreen = () => {
  const navigation = useNavigation()
  const {isLoading, setIsLoading} = useState(true)
  const {userId} = useContext(AuthContext)
  const {likes, setLikes} = useState([])

  useFocusEffect(
    useCallback(() => {
      if(userId){
        fetchRecievedLikes();
      }
    }, [userId])
  )

  const fetchRecievedLikes = async () => {
    try{
      const token = await AsyncStorage.getItem('token')
      const response = await axios.get(`${BASE_URL}/received-likes/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const receivedLikes = response.data.receivedLikes;
      setLikes(receivedLikes)
    } catch(error){
      console.log("Error", error)
    } finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecievedLikes()
  }, [userId])

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView>
        {likes.length > 0 ? (
          <>
            <View>

            </View>
          </>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default LikesScreen

const styles = StyleSheet.create({})