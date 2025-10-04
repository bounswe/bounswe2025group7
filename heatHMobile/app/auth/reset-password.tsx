import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button'
import {Platform, TextInput, KeyboardAvoidingView, ScrollView} from "react-native";
import {useState} from "react";

export default function ResetPasswordScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
                <ThemedView style={{padding: 20}}>
                    <ThemedText>Forgot Password</ThemedText>
                    <TextInput
                        placeholder={"Email address*"}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        placeholder={"Password"}
                        value={password}
                        onChangeText={setPassword}
                        />
                    <TextInput
                        placeholder={"Confirm Password"}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        />
                    <Button title={"Reset Password"}/>
                    <Button title={"Cancel"}/>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>

    );
}


