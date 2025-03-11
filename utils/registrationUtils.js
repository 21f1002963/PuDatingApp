import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveRegistrationProgress = async (screenName, data) => {
    try{
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.setItem(key, JSON.stringify(data));
    }
    catch(err){
        console.log(err);
    }
}

export const getRegistrationProgress = async (screenName) => {
    try{
        const key = `registration_progress_${screenName}`;
        const data = await AsyncStorage.getItem(key);
        return data !== null ? JSON.parse(data) : null;
    }
    catch(err){
        console.log(err);
    }
}