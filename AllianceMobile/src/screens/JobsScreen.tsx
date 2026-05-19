import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { JobCard } from '../components/jobs/JobCard';
import { SearchBar } from '../components/ui/SearchBar';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Banner } from '../components/layout/Banner';
import { getJobs, applyToJob, saveJob } from '../services/jobs.service';
import type { Job } from '../types';

const FALLBACK: Job[] = [
  { _id: '1', title: 'Desarrollador Fullstack', company: { _id: 'c1', name: 'Globant', availableJobs: 3, createdAt: '' }, location: 'Cali / Remoto', salaryRange: 'A convenir', description: 'Stack NestJS + React. Proyectos internacionales.', tags: ['React', 'NestJS'], applicants: [], savedBy: [], createdAt: '' },
  { _id: '2', title: 'Backend Developer', company: { _id: 'c2', name: 'Zonamerica', availableJobs: 5, createdAt: '' }, location: 'Cali', salaryRange: 'COP 3M-5M', description: 'Node.js y MongoDB en proyectos fintech.', tags: ['Node.js', 'MongoDB'], applicants: [], savedBy: [], createdAt: '' },
  { _id: '3', title: 'UI/UX Designer', company: { _id: 'c3', name: 'Startup Valle', availableJobs: 1, createdAt: '' }, location: 'Remoto', description: 'Diseño de interfaces en Figma y Framer.', tags: ['Figma', 'UX'], applicants: [], savedBy: [], createdAt: '' },
];

const FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Remoto', value: 'Remoto' },
  { label: 'Cali', value: 'Cali' },
  { label: 'Híbrido', value: 'Híbrido' },
];

export function JobsScreen() {
  const { token } = useAuthStore();
  const toast = useToast();
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);
  const [filter, setFilter]       = useState('');

  const load = async (title = '', location = '', refresh = false) => {
    if (refresh) setRefresh(true); else setLoading(true);
    try {
      const data = await getJobs(title, location);
      setJobs(data.length > 0 ? data : FALLBACK);
    } catch { setJobs(FALLBACK); }
    finally { setLoading(false); setRefresh(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (q: string) => load(q, filter);
  const handleFilter = (val: string) => { setFilter(val); load('', val); };

  const handleApply = async (id: string) => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    try { await applyToJob(token, id); toast.success('¡Postulación enviada! 🚀'); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleSave = async (id: string) => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    try { await saveJob(token, id); toast.info('Vacante guardada 🔖'); }
    catch (err: any) { toast.error(err.message); }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={loading ? [] : jobs}
        keyExtractor={(j) => j._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('', filter, true)} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Bolsa de Empleos 💼</Text>
            <Banner title="+ 1 Millón de oportunidades" subtitle="Vacantes exclusivas para la comunidad Javeriana" variant="pink" />
            <SearchBar
              placeholder="¿Qué cargo buscas?"
              onSearch={handleSearch}
              filters={FILTERS}
              activeFilter={filter}
              onFilterChange={handleFilter}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? <View style={{ gap: 12 }}>{[1,2,3].map((n) => <SkeletonCard key={n} />)}</View>
          : <View style={styles.empty}><Text style={styles.emptyText}>No hay vacantes disponibles</Text></View>
        }
        renderItem={({ item }) => <JobCard {...item} onApply={handleApply} onSave={handleSave} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.mint },
  list:       { padding: 16, paddingBottom: 100, gap: 0 },
  header:     { gap: 16, marginBottom: 16 },
  pageTitle:  { fontSize: 24, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  empty:      { alignItems: 'center', paddingVertical: 60 },
  emptyText:  { fontSize: 16, color: Colors.textGray, fontWeight: '600' },
});
