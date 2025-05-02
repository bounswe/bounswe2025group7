import {Image, View, ImageBackground, StyleSheet, SafeAreaView, Text} from 'react-native'
import backgroundImage from '../../assets/images/auth/login.jpg'

// custom components
import {AuthForm} from '../../components/auth/ThemedAuth'
import Spacer from '../../components/general/Spacer'

const Login = () => {

  return (
  <ImageBackground source={backgroundImage} style = {styles.background}>
    <SafeAreaView style = {styles.container}>
      {/* app's logo */}


      {/* login header */}
      <Spacer height = '10%'/>
      <Text style = {styles.header}>
        NutriMate
      </Text>

      {/* Auth container */}
      <Spacer height = '13%'/>
      <AuthForm type = 'register'/>

      
      
    </SafeAreaView>
  </ImageBackground>
    
  )
}

export default Login

const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
      alignItems: 'center'
    },
    background: {
      flex: 1,
      resizeMode: 'cover',
    },
    header: {
      fontSize: 39,
      fontWeight: 'bold',
      color: '#EEF4E6', // Light color, so let's enhance it further
      textShadowColor: 'rgba(0, 0, 0, 0.5)', // Dark shadow for contrast
      textShadowOffset: { width: 1, height: 1 }, // Position of the shadow
      textShadowRadius: 5
    }
  }
);