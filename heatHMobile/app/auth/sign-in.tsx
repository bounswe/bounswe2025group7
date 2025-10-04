// app/sign-in.tsx (or wherever your auth screens are)
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button';

import {
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { useState } from "react";
import { useRouter } from 'expo-router';
import Spacer from "@/components/ui/Spacer";
import {Space_Separator} from "json5/lib/unicode"; // If using expo-router

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter(); // Remove if not using expo-router

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignIn = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email');
            return;
        }

        // Here you would typically make an API call to your backend

        Alert.alert('Success', 'Logged in successfully!');

        // Reset form
        setEmail('');
        setPassword('');
    };

    const goToSignUp = () => {
        // router.push('/sign-up'); // If using expo-router
        // Or use your navigation method
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={styles.form}>
                    <ThemedText type={"title"}
                                style={{textAlign:"center"}}>
                        {'HeatH'}
                    </ThemedText>
                    <ThemedText type={"subtitle"}
                                style={{textAlign:"center"}}>
                        {'Sign in to continue'}
                    </ThemedText>
                    <ThemedView>
                        <ThemedText>Email</ThemedText>
                        <Input
                            style={styles.input}
                            placeholder="Email Address*"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </ThemedView>

                    <ThemedView>
                        <ThemedText>Password</ThemedText>
                        <Input
                            style={styles.input}
                            placeholder="Password*"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </ThemedView>
                    <Spacer/>
                    <TouchableOpacity>
                        <ThemedText type={"link"}
                                    style={{textAlign:"right"}}>
                            Forgot Password?
                        </ThemedText>
                    </TouchableOpacity>
                    <Spacer/>

                    <Button title="Sign In" onPress={handleSignIn} />
                    <Spacer/>

                    <ThemedView>
                        <ThemedText>
                            {"Don't have an account? "}
                        </ThemedText>
                        <TouchableOpacity onPress={goToSignUp}>
                            <ThemedText type={"link"}>
                                {'Sign Up'}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    input: {
        fontFamily: 'Sora',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
});