import {useRef, useEffect, useState} from 'react'
import {View, StyleSheet, useColorScheme, Image, Text, TextInput, Pressable} from 'react-native'
import {Link} from 'expo-router'
import {AuthColors} from '../../styles/Colors'
import Spacer from '../general/Spacer'

import verificationLogo from '../../assets/images/auth/email.png'

// Import authService methods
import { login as loginUser, register as registerUser, sendVerificationCode, verifyCode } from '../../services/authService';

// Decode token
// import jwtDecode from 'jwt-decode'; TO DO


export const AuthContainer = ({style ,children, ...props}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];
    
    return (
        <>
            <View style = {[style, theme.authContainer]}>
                {/* transparent background overlay */}
                <View style = {theme.authContainerOverlay}>
                </View>

                {/* Auth Container's children components */}
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



// Code verification components
export const AuthCodeInput = ({ length = 6, code, setCode, onCodeFilled }) => {

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.slice(-1); // Only last character
    setCode(newCode);

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    // Call callback when all digits are filled
    if (newCode.every(d => d !== '') && onCodeFilled) {
      onCodeFilled(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    
    // case: "cursor after number"
    if (e.nativeEvent.key != 'Backspace' && index < length - 1 && code[index] != '')
        {   
            // move to next
            inputs.current[index + 1].focus();
            // fill by preessed key
            const newCode = [...code];
            newCode[index+1] = e.nativeEvent.key;
            setCode(newCode);
            
            if(index + 1 < length - 1)inputs.current[index + 2].focus;
        }
    // case: "backspace"
    if (e.nativeEvent.key === 'Backspace'  && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.codeContainer}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType = "numeric"
          maxLength={1}
          style={styles.input}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
};



export const AuthForm = ({type = 'login'}) => {
    const theme = AuthColors[useColorScheme() ?? 'light'];

    // rendering cases
    const [authState, setState] = useState(type);

    // connect type to authState (if changed from file outside, will change authState!)
    useEffect(() => {
    setState(type);
    }, [type]);

    // controlling auth requests
    const [email, setEmail] = useState(''); // user email
    const [password, setPassword] = useState(''); // user password
    const [code, setCode] = useState(Array(6).fill('')); // verification code
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async () => {
    setLoading(true);
    console.log('Submitting...');

    
    try {
        if (authState === 'login') {
            const { accessToken, refreshToken } = await loginUser(email, password);
            console.log(`Login Successful ${accessToken} ${refreshToken}`); // Log result here
            
            // TODO: store tokens and navigate to main app
        } 
        else if(authState === 'registration'){
            // set code verification state
            setState('verification');
            // send verification code
            const message = await sendVerificationCode(email);
            console.log(message);
        }
        else if(authState === 'verification'){ // verification passed - can register !
            
            // check entered verification code
            console.log("Code: ",code.join(''), " sent to verification !")
            const isValid = await verifyCode(code.join(''));
            
            
            if(isValid) {
                console.log("Code verified successfully!");
                setState('verificationSuccess');
                const { accessToken, refreshToken } = await registerUser(login, password);
                console.log('Registration Successful', { accessToken, refreshToken }); // Log result here
            
                // TODO: store tokens and maybe redirect to login or dashboard
            }
            else {
                console.log("Wrong verification code!");
                setState('verificationFail');
            }
        }
    } catch (err) {
        console.error('[Error]:', err);  // Log error if something goes wrong
    } finally {
        setLoading(false);
    }
    };


    return (    
        <AuthContainer>
            {/* header title */}
            <Spacer/>
            <Text style = {theme.authTitle}>
                {(authState === 'login') ? 'Login' : ((authState === 'verification') ? 'Verify Code' : 'Register')}
            </Text>
            

            {
                (authState === 'verification') ? 
                (
                    // code verification
                    <>
                        {/* Verification Logo */}
                        <Spacer/>
                        <Image style = {{width: 70, height: 70}} source = {verificationLogo}/>
                        
                        {/* Info */}
                        <Spacer/>
                        <Text style = {{color: '#D2CBC2', fontSize: 15}}>
                            Please enter code we sent to your email.
                        </Text>

                        {/* Input Field */}
                        <Spacer height = {10}/>
                        <AuthCodeInput code = {code} setCode = {setCode}/>
                        
                        {/* Submit Button */}
                        <Spacer height = {20}/>
                        <Pressable onPress = {handleSubmit} style = {({pressed}) => [theme.authButton, pressed && theme.authButtonPressed, {width: 100}]}>
                            <Text style = {theme.authButtonText}>
                                Verify
                            </Text>
                        </Pressable>
                        <Spacer/>    
                    </>
                )
                :
                <>
                    {/* Don't have an account ? */}
                    <Spacer height = {13}/>
                    <Text style = {{color: '#D2CBC2'}}>
                            {(authState === 'login') ? "Don't have an account yet ?" : "Already have an account ?"}
                        <Text> </Text>
                        <Text onPress = {() => setState((authState === 'login') ? "registration" : "login")}>
                            <Text style = {{color: '#FBCB27', textDecorationLine: 'underline'}}>
                                {(authState === 'login') ? "Sign Up" : "Sign In"}
                            </Text>
                        </Text>
                    </Text>

                
                    {/* Email Input */}
                    <Spacer/>
                    <AuthInput onChangeText = {setEmail} value = {email} placeholder = {'Email'} />
                    
                    {/* Password Input */}
                    <Spacer/>
                    <AuthInput onChangeText = {setPassword} value = {password} placeholder = 'Password'/>
                

                    {/* Submit Button */}
                    <Spacer height = {30}/>
                    <Pressable onPress = {handleSubmit} style = {({pressed}) => [theme.authButton, pressed && theme.authButtonPressed]}>
                        <Text style = {theme.authButtonText}>
                            {(authState === 'login') ? 'Login' : 'Register'}
                        </Text>
                    </Pressable>
                    <Spacer/>    
                </>
            }

            
        </AuthContainer>
    )
}

const styles = StyleSheet.create(
{
    container: {
        width: '80%',
        padding: '5%'
    },
    codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  input: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#CAA123',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  }
});
