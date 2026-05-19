import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { PostCard } from '../components/feed/PostCard';
import { CreatePost } from '../components/feed/CreatePost';
import { StoriesBar } from '../components/feed/StoriesBar';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Banner } from '../components/layout/Banner';
import { getPosts, createPost, toggleLike, addComment } from '../services/posts.service';
import type { Post } from '../types';

const FALLBACK_POSTS: Post[] = [
  {
    _id: '1',
    author: { _id: 'u1', name: 'Derik Muñoz', career: 'Ing. Sistemas', skills: [], connections: [], connectionRequests: [], email: '', createdAt: '' },
    content: '¡Alliance Mobile ha aterrizado! 🚀 La comunidad de ingeniería ahora en tu bolsillo.',
    likes: [], comments: [], hashtags: ['Alliance', 'Mobile', 'RN'], createdAt: new Date().toISOString(),
  },
];

export function FeedScreen() {
  const { user, token } = useAuthStore();
  const toast = useToast();
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data.length > 0 ? data : FALLBACK_POSTS);
    } catch { setPosts(FALLBACK_POSTS); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleCreate = async (content: string) => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    try {
      const post = await createPost(token, { content });
      setPosts((prev) => [post, ...prev]);
      toast.success('Post publicado ✓');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleLike = async (id: string) => {
    if (!token) return;
    try {
      const updated = await toggleLike(token, id);
      setPosts((prev) => prev.map((p) => p._id === id ? updated : p));
    } catch {}
  };

  const handleComment = async (id: string, text: string) => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    try {
      const updated = await addComment(token, id, text);
      setPosts((prev) => prev.map((p) => p._id === id ? updated : p));
      toast.success('Comentario publicado ✓');
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={loading ? [] : posts}
        keyExtractor={(p) => p._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.logoText}>ALLIANCE</Text>
            <Banner
              title="¡Bienvenido a la red!"
              subtitle="Conecta, aprende y crece con ingenieros de la Javeriana"
              cta="Ver perfil"
              variant="pink"
            />
            <View style={styles.storiesSection}>
              <Text style={styles.sectionTitle}>Historias</Text>
              <StoriesBar stories={[]} user={user} />
            </View>
            <CreatePost user={user} onSubmit={handleCreate} />
            <Text style={styles.sectionTitle}>Publicaciones Recientes</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12 }}>
              {[1,2,3].map((n) => <SkeletonCard key={n} />)}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard {...item} token={token} onLike={handleLike} onComment={handleComment} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.mint },
  list: { padding: 16, paddingBottom: 100 },
  header: { gap: 16, marginBottom: 16 },
  logoText: { fontSize: 26, fontWeight: '900', color: Colors.textDark, letterSpacing: -1 },
  storiesSection: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 },
});
