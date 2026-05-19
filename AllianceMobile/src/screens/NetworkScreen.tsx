import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { NetworkCard } from '../components/networking/NetworkCard';
import { SearchBar } from '../components/ui/SearchBar';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Banner } from '../components/layout/Banner';
import { getNetworkSuggestions, sendConnectionRequest, searchUsers } from '../services/users.service';
import type { User } from '../types';

const FALLBACK: User[] = [
  { _id: 'u1', name: 'Vanessa Rojas', career: 'Ingeniería de Software', email: '', skills: ['React', 'Python'], connections: [], connectionRequests: [], createdAt: '' },
  { _id: 'u2', name: 'Andrés Felipe', career: 'Ingeniería Civil', email: '', skills: ['AutoCAD'], connections: [], connectionRequests: [], createdAt: '' },
  { _id: 'u3', name: 'Mariana Paz', career: 'Ingeniería Multimedia', email: '', skills: ['UX', 'Figma'], connections: [], connectionRequests: [], createdAt: '' },
  { _id: 'u4', name: 'Carlos Mario', career: 'Ingeniería de Sistemas', email: '', skills: ['Node.js', 'MongoDB'], connections: [], connectionRequests: [], createdAt: '' },
  { _id: 'u5', name: 'Isabella Ruiz', career: 'Ingeniería Industrial', email: '', skills: ['Lean', 'Six Sigma'], connections: [], connectionRequests: [], createdAt: '' },
];

export function NetworkScreen() {
  const { token } = useAuthStore();
  const toast = useToast();
  const navigation = useNavigation<any>();
  const [users, setUsers]         = useState<User[]>([]);
  const [allUsers, setAllUsers]   = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefresh(true); else setLoading(true);
    try {
      if (!token) throw new Error('no token');
      const data = await getNetworkSuggestions(token);
      const list = data.length > 0 ? data : FALLBACK;
      setUsers(list);
      setAllUsers(list);
    } catch { setUsers(FALLBACK); setAllUsers(FALLBACK); }
    finally { setLoading(false); setRefresh(false); }
  };

  useEffect(() => { load(); }, []);

  const handleConnect = async (userId: string) => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    try { await sendConnectionRequest(token, userId); toast.success('Solicitud enviada ✓'); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setUsers(allUsers); return; }
    try {
      const res = await searchUsers(q);
      const list: User[] = res.users ?? res ?? [];
      setUsers(list.length > 0 ? list : allUsers.filter((u) =>
        u.name.toLowerCase().includes(q.toLowerCase())
      ));
    } catch {
      setUsers(allUsers.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())));
    }
  };

  const handleMessage = (userId: string) => {
    const targetUser = users.find(u => u._id === userId);
    navigation.navigate('Chat', {
      openUserId: userId,
      openUserName: targetUser?.name ?? 'Usuario',
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={loading ? [] : users}
        keyExtractor={(u) => u._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Mi Red 🌐</Text>
            <Banner title="Expande tu red profesional" subtitle="Conecta con ingenieros y reclutadores" variant="lime" />
            <SearchBar placeholder="Buscar ingenieros..." onSearch={handleSearch} />
          </View>
        }
        ListEmptyComponent={
          loading ? <View style={{ gap: 12 }}>{[1,2,3,4].map((n) => <SkeletonCard key={n} />)}</View> : null
        }
        renderItem={({ item }) => (
          <NetworkCard user={item} onConnect={handleConnect} onMessage={handleMessage} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.mint },
  list:      { padding: 16, paddingBottom: 100 },
  header:    { gap: 16, marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
});
