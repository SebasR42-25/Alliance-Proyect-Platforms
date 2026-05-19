import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { register, login } from '../../services/auth.service';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function RegisterScreen({ navigation }: Props) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const loginStore = useAuthStore((s) => s.login);
  const toast = useToast();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { toast.error('Completa todos los campos'); return; }
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      const data = await login(email.trim(), password);
      await loginStore(data.user, data.access_token);
      toast.success('¡Cuenta creada! Bienvenido a Alliance 🎉');
    } catch (err: any) {
      toast.error(err?.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.heroBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.brand}>ALLIANCE</Text>
          <Text style={styles.tagline}>Únete a la comunidad de ingeniería</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crear Cuenta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Sebastián Rojas"
              placeholderTextColor={Colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo Institucional</Text>
            <TextInput
              style={styles.input}
              placeholder="nombre@javeriana.edu.co"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkAccent}>Inicia sesión</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.mint },
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  heroBox:    { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    marginBottom: 16,
  },
  logoLetter: { fontSize: 40, fontWeight: '900', color: '#fff' },
  brand:      { fontSize: 32, fontWeight: '900', color: Colors.textDark, letterSpacing: -1 },
  tagline:    { fontSize: 14, color: Colors.textGray, fontWeight: '600', marginTop: 4 },
  card:       {
    backgroundColor: Colors.white, borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },
  cardTitle:  { fontSize: 22, fontWeight: '900', color: Colors.textDark, marginBottom: 24 },
  field:      { marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 6 },
  input:      {
    backgroundColor: Colors.inputBg, borderRadius: 14, padding: 14,
    fontSize: 15, color: Colors.textDark, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  btn:        {
    backgroundColor: Colors.lime, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  btnText:    { color: Colors.textDark, fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  link:       { marginTop: 20, alignItems: 'center' },
  linkText:   { fontSize: 14, color: Colors.textGray, fontWeight: '500' },
  linkAccent: { color: Colors.primary, fontWeight: '800' },
});
