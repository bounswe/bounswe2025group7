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
        <TextInput placeholder = {placeholder} style = {[style, theme.authInput]} placeholderTextColor= {'white'} {...props}/>
    )
}

export const AuthForm = ({type = 'Login'}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];

    return (    
        <AuthContainer>
            <Spacer/>
            <Text style = {theme.authTitle}>
                Login
            </Text>

            <Spacer height = {13}/>
            <Text style = {{color: '#C0B79B'}}>
                    Don't have an account yet ?  
                <Text> </Text>
                <Link href = '/'>
                    <Text style = {{color: '#CDA127', textDecorationLine: 'underline'}}>
                        Sign Up
                    </Text>
                </Link>
            </Text>

            <Spacer/>
            <AuthInput placeholder = {type}/>

            <Spacer/>
            <AuthInput placeholder = 'Password'/>

            <Spacer height = {30}/>
            <Pressable style = {({pressed}) => [theme.authButton, pressed && theme.authButtonPressed]}>
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