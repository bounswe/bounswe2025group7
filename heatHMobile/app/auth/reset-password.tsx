import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spacer from '@/components/ui/Spacer'
import {Platform, KeyboardAvoidingView, ScrollView} from "react-native";
import {useState} from "react";

export default function ResetPasswordScreen() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Spacer/>
            <ScrollView>
                <ThemedView style={{padding: 20}}>
                    <Spacer/>
                    <ThemedText>Forgot Password</ThemedText>
                    <Spacer/>
                    <Input
                        placeholder={"Email address*"}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Spacer/>
                    <Input
                        placeholder={"Password"}
                        value={password}
                        onChangeText={setPassword}
                        />
                    <Spacer/>
                    <Input
                        placeholder={"Confirm Password"}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        />
                    <Spacer/>
                    <Button title={"Reset Password"}/>
                    <Spacer/>
                    <Button title={"Cancel"}/>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>

    );
}


