import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import {Platform, KeyboardAvoidingView, ScrollView} from "react-native";
import {useState} from "react";

export default function ForgotPasswordScreen() {

    const [email, setEmail] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
                <ThemedView style={{padding: 20}}>
                    <ThemedText>Forgot Password</ThemedText>
                    <Input
                        placeholder={"Email address*"}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Button title={"Send Verification Code"}/>
                    <Button title={"Back to Sign in"}/>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>

  );
}


