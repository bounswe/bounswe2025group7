import {Platform, Pressable, Image, View, ImageBackground, StyleSheet, SafeAreaView, Text} from 'react-native'
import Spacer from '../../components/general/Spacer'
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

// import button logos
import goBackButtonLogo from '../../assets/images/general/arrow.backward.png'

const InterestFormPage = () => {
    const navigation = useNavigation(); // Hook to access the navigation prop

    return (
        <SafeAreaView style = {styles.container}>
            
                <View style = {{ flex: 5,  borderColor: 'red', borderWidth: 3, justifyContent: 'center'}}>
                    <Spacer height ='30%'/>
                    
                    <View style = {{paddingHorizontal: '4%'}}>
                        <Text style = {styles.title}>
                            Start
                        </Text>
                        <Text style = {styles.title}>
                            Your journey
                        </Text>
                        <Spacer/>
                    </View>
                    
                    <View style = {{paddingHorizontal: '4%'}}>
                        <Text style = {styles.smallText}>
                            Let's get started!
                        </Text>
                        <Text style = {styles.smallText}>
                            Tell us a bit about your health so we can create a plan just for you.
                        </Text>
                    </View>
                    <Spacer/>
                </View> 
                <View style = {[styles.buttonContainer, {paddingHorizontal: '4%'}]}>

                    {/* Go Back Button */}
                    <Pressable
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
                        style = {({ pressed }) => [
                            styles.buttonBack,
                            Platform.OS === 'ios' && pressed && { opacity: 0.85 }, // Only apply opacity on iOS
                        ]}
                        onPress={() => {
                                navigation.navigate('auth/authentication');
                        }}
                    >

                            <Image style = {{width: '60%', height: '60%'}} source = {goBackButtonLogo}/>
                    </Pressable>
                    

                    {/* Let's Start! button */}
                    <Pressable
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
                        style = {({ pressed }) => [
                            styles.buttonNext,
                            Platform.OS === 'ios' && pressed && { opacity: 0.85 }, // Only apply opacity on iOS
                        ]}
                        onPress={() => {
                            navigation.navigate('form/interestForm');
                        }}
                    >
                            {({ pressed }) => (
                                <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>
                                Let's Start!
                                </Text>
                            )}
                    </Pressable>

                </View>
        </SafeAreaView>
        
        
    )
}

export default InterestFormPage;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%', 
        backgroundColor: '#46A681', 
        flexDirection: 'column',
        justifyContent: 'center'
    },
    title: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#0E2E2A',
        textAlign: 'left',
    },
    smallText: {
        fontSize: 18,
        color: '#0E2E2A', // Darker shade of the same color
        textAlign: 'left',
        marginTop: 10,
    },
    buttonContainer: {
        flex: 1, 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderColor: 'red', 
        borderWidth: 3,
        paddingBottom: '5%'
    },
    buttonBack: {
        backgroundColor: '#3E5F51', // A deeper muted green for secondary
        height: '45%',
        width: '17%',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'    
    },

    buttonNext: {
        backgroundColor: '#0B1F1C', // Keep your original color
        height: '45%',
        width: '79%',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },

    buttonTextPressed: {
        color: '#E6FFF3', // Slightly lighter for pressed state
    },



});
