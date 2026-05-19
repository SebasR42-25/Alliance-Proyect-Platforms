import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { NewsCard } from '../components/news/NewsCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Banner } from '../components/layout/Banner';
import { getNews } from '../services/news.service';
import type { NewsItem } from '../types';

const FALLBACK: NewsItem[] = [
  { _id: '1', title: 'Alianza Estratégica: Javeriana y Zonamerica', content: 'Convenio oficial para pasantías de ingeniería en el parque tecnológico más grande de la región.', category: 'Convenio', author: { name: 'Comunicaciones' }, createdAt: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800' },
  { _id: '2', title: 'Cali: Próximo Hub de Inteligencia Artificial', content: 'Inversión extranjera posiciona a la ciudad como líder en desarrollo de software avanzado en Latam.', category: 'Tendencia', author: { name: 'Tech Insight' }, createdAt: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800' },
  { _id: '3', title: 'Lanzamiento de Alliance Mobile', content: 'La nueva versión móvil llega con diseño nativo, reels y chat en tiempo real.', category: 'Plataforma', author: { name: 'DevTeam' }, createdAt: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800' },
];

export function NewsScreen() {
  const [news, setNews]           = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefresh(true); else setLoading(true);
    try {
      const data = await getNews();
      setNews(data.length > 0 ? data : FALLBACK);
    } catch { setNews(FALLBACK); }
    finally { setLoading(false); setRefresh(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={loading ? [] : news}
        keyExtractor={(n) => n._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Tech News 📰</Text>
            <Banner title="Noticias que impulsan tu carrera" subtitle="Lo mejor del ecosistema tecnológico" variant="blue" />
          </View>
        }
        ListEmptyComponent={
          loading ? <View style={{ gap: 12 }}>{[1,2,3].map((n) => <SkeletonCard key={n} />)}</View> : null
        }
        renderItem={({ item }) => <NewsCard {...item} />}
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
