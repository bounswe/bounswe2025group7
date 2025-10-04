import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { storage } from '@/utils/storage';

export default function DebugStorage() {
  const [storageState, setStorageState] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  }>({ accessToken: null, refreshToken: null });

  const checkStorage = async () => {
    try {
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      setStorageState({ accessToken, refreshToken });
      console.log('🔍 DebugStorage: Current storage state:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
    } catch (error) {
      console.error('🔍 DebugStorage: Error checking storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await storage.clear();
      setStorageState({ accessToken: null, refreshToken: null });
      console.log('🔍 DebugStorage: Storage cleared');
    } catch (error) {
      console.error('🔍 DebugStorage: Error clearing storage:', error);
    }
  };

  useEffect(() => {
    checkStorage();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Storage Debug</ThemedText>
      <ThemedText style={styles.label}>Access Token:</ThemedText>
      <ThemedText style={styles.value}>
        {storageState.accessToken ? `${storageState.accessToken.substring(0, 20)}...` : 'null'}
      </ThemedText>
      <ThemedText style={styles.label}>Refresh Token:</ThemedText>
      <ThemedText style={styles.value}>
        {storageState.refreshToken ? `${storageState.refreshToken.substring(0, 20)}...` : 'null'}
      </ThemedText>
      <Button title="Refresh Storage State" onPress={checkStorage} style={styles.button} />
      <Button title="Clear Storage" onPress={clearStorage} style={[styles.button, styles.clearButton]} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#e0e0e0',
    padding: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  button: {
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
});


