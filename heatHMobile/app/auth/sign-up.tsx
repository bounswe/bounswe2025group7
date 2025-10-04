import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';

import {
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity
} from 'react-native';
import { useState } from "react";
import { useRouter } from 'expo-router'; // If using expo-router

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter(); // Remove if not using expo-router

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignUp = () => {
        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email');
            return;
        }

        if (!name) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        // Here you would typically make an API call to your backend
        Alert.alert('Success', 'Account created successfully!');

        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
    };

    const goToSignIn = () => {
        // router.push('/sign-in'); // If using expo-router
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
                <ThemedView>
                    <ThemedText type={"title"}>
                        {'HeatH'}
                    </ThemedText>
                    <ThemedText type={"subtitle"}>
                        {'Sign up to get started'}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.form}>
                    <ThemedView>
                        <ThemedText>Full Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </ThemedView>

                    <ThemedView>
                        <ThemedText>Email</ThemedText>
                        <TextInput
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
                        <TextInput
                            style={styles.input}
                            placeholder="Password*"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </ThemedView>

                    <ThemedView>
                        <ThemedText>Confirm Password</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password*"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </ThemedView>

                    <Button title="Sign Up" onPress={handleSignUp} />

                    <ThemedView>
                        <ThemedText>
                            {'Already have an account? '}
                        </ThemedText>
                        <TouchableOpacity onPress={goToSignIn}>
                            <ThemedText>
                                {'Sign In'}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});