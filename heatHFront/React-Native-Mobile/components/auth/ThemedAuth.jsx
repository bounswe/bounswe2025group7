import {useState} from 'react'
import {View, StyleSheet, useColorScheme, Text, TextInput, Pressable} from 'react-native'
import {Link} from 'expo-router'
import {AuthColors} from '../../styles/Colors'
import Spacer from '../general/Spacer'

export const AuthContainer = ({style ,children, ...props}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];
    
    return (
        <>
            <View style = {[style, theme.authContainer]}>
                <View style = {theme.authContainerOverlay}>

                </View>
                {children}
            </View>
        </>
        
        
    )
}

export const AuthInput = ({style, placeholder = 'email', ...props}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];
    
    return (
        <TextInput placeholder = {placeholder} style = {[style, theme.authInput]} placeholderTextColor= {'white'}  autoCapitalize = "none" {...props}/>
    )
}

export const AuthForm = ({type = 'login'}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];

    const handleSubmit = () => {
        console.log('Data submitted: Email: ', email, ' Password: ', password);
    }


    const [email, setEmail] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    return (    
        <AuthContainer>
            <Spacer/>
            <Text style = {theme.authTitle}>
                {(type === 'login') ? 'Login' : 'Register'}
            </Text>

            <Spacer height = {13}/>
            <Text style = {{color: '#D2CBC2'}}>
                    {(type === 'login') ? "Don't have an account yet ?" : "Already have an account ?"}
                <Text> </Text>
                <Link href = 'auth/register'>
                    <Text style = {{color: '#FBCB27', textDecorationLine: 'underline'}}>
                        {(type === 'login') ? "Sign Up" : "Sign In"}
                    </Text>
                </Link>
            </Text>

            <Spacer/>
            <AuthInput onChangeText = {setEmail} value = {email} placeholder = {(type === 'login') ? 'Login or Email' : 'Email'} />
            
            {
                (type === 'register') ? (
                <>
                    <Spacer/> 
                    <AuthInput onChangeText = {setLogin} value = {login} placeholder = 'Login' /> 
                </> ) : null
            }

            <Spacer/>
            <AuthInput onChangeText = {setPassword} value = {password} placeholder = 'Password'/>

            <Spacer height = {30}/>
            <Pressable onPress = {handleSubmit} style = {({pressed}) => [theme.authButton, pressed && theme.authButtonPressed]}>
                <Text style = {theme.authButtonText}>
                    Login
                </Text>
            </Pressable>
            <Spacer/>
        </AuthContainer>
    )
}

const styles = StyleSheet.create(
{
    container: {
        width: '80%',
        padding: '5%'
    }
});