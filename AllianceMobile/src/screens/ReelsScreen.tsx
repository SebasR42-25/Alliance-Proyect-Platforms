import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { getReels } from '../services/reels.service';
import { pickAndUploadReel } from '../services/upload.service';
import type { Reel } from '../types';

const FALLBACK: Reel[] = [
  {
    _id: '1',
    author: { _id: 'u1', name: '@derik_dev', email: '', career: 'Ing. Sistemas', skills: [], connections: [], connectionRequests: [], createdAt: '' },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: '¡Alliance Mobile ha llegado! 🚀',
    likesCount: 48,
    createdAt: '',
  },
  {
    _id: '2',
    author: { _id: 'u2', name: '@vane_rojas', email: '', career: 'Ing. Industrial', skills: [], connections: [], connectionRequests: [], createdAt: '' },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    caption: 'Analizando datos en la Javeriana 📊',
    likesCount: 120,
    createdAt: '',
  },
  {
    _id: '3',
    author: { _id: 'u3', name: '@camilo_mv', email: '', career: 'Ing. Civil', skills: [], connections: [], connectionRequests: [], createdAt: '' },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Nuevo semestre, nuevos proyectos 🏗️',
    likesCount: 77,
    createdAt: '',
  },
];

function ReelItem({
  reel, isActive, height,
}: { reel: Reel; isActive: boolean; height: number }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likesCount ?? 0);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer({ uri: reel.videoUrl }, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive) player.play(); else player.pause();
  }, [isActive]);

  useEffect(() => { player.muted = muted; }, [muted]);

  const avatarUrl = reel.author?.profilePicture
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.author?.name ?? 'U')}&background=E91E8C&color=fff&size=128`;

  return (
    <View style={[styles.reel, { height }]}>
      {/* Video fullscreen */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        surfaceType="textureView"
        onFirstFrameRender={() => setReady(true)}
      />

      {/* Loader */}
      {!ready && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Mute */}
      <TouchableOpacity style={styles.muteBtn} onPress={() => setMuted(m => !m)} activeOpacity={0.8}>
        <MaterialCommunityIcons name={muted ? 'volume-off' : 'volume-high'} size={18} color="#fff" />
      </TouchableOpacity>

      {/* Acciones laterales */}
      <View style={styles.sideActions}>
        <View style={styles.authorWrap}>
          <Image source={{ uri: avatarUrl }} style={styles.authorAvatar} />
          <View style={styles.followDot}>
            <Text style={styles.followPlus}>+</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => { setLiked(p => !p); setLikes(p => liked ? p - 1 : p + 1); }} style={styles.actionBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name={liked ? 'heart' : 'heart-outline'} size={32} color={liked ? '#FF4D6D' : '#fff'} />
          <Text style={styles.actionCount}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name="comment-outline" size={30} color="#fff" />
          <Text style={styles.actionCount}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name="share-variant-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info inferior */}
      <View style={styles.bottomInfo}>
        <Text style={styles.reelUser}>{reel.author?.name}</Text>
        {reel.author?.career ? <Text style={styles.reelCareer}>{reel.author.career}</Text> : null}
        {reel.caption ? <Text style={styles.reelCaption}>{reel.caption}</Text> : null}
      </View>
    </View>
  );
}

export function ReelsScreen() {
  const { token } = useAuthStore();
  const toast = useToast();
  const [reels, setReels]         = useState<Reel[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  const onViewableChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIdx(viewableItems[0].index ?? 0);
  }).current;

  const load = useCallback(async () => {
    try {
      const data = await getReels();
      setReels(data.length > 0 ? data : FALLBACK);
    } catch { setReels(FALLBACK); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!token) { toast.error('Debes iniciar sesión'); return; }
    setUploading(true);
    try {
      const ok = await pickAndUploadReel('Mi nuevo reel 🎬');
      if (ok) { toast.success('Reel publicado ✓'); await load(); }
    } catch { toast.error('Error subiendo el reel'); }
    finally { setUploading(false); }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando reels...</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.root}
      onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
    >
      {listHeight > 0 && (
        <>
          <FlatList
            data={reels}
            keyExtractor={(r) => r._id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            getItemLayout={(_, index) => ({
              length: listHeight,
              offset: listHeight * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <ReelItem reel={item} isActive={index === activeIdx} height={listHeight} />
            )}
            removeClippedSubviews
            windowSize={3}
            maxToRenderPerBatch={2}
            initialNumToRender={1}
          />

          {/* FAB subir reel */}
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.85}
            onPress={handleUpload}
            disabled={uploading}
          >
            <MaterialCommunityIcons name={uploading ? 'loading' : 'plus'} size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#000' },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', gap: 12 },
  loadingText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  reel:        { width: '100%', backgroundColor: '#000', overflow: 'hidden' },
  loader:      { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },

  muteBtn:     { position: 'absolute', top: 52, right: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },

  sideActions: { position: 'absolute', right: 14, bottom: 185, alignItems: 'center', gap: 22 },
  authorWrap:  { position: 'relative' },
  authorAvatar:{ width: 46, height: 46, borderRadius: 13, borderWidth: 2, borderColor: '#fff' },
  followDot:   { position: 'absolute', bottom: -8, alignSelf: 'center', width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  followPlus:  { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  actionBtn:   { alignItems: 'center', gap: 3 },
  actionCount: { color: '#fff', fontSize: 12, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } },

  bottomInfo:  { position: 'absolute', left: 14, right: 80, bottom: 100, gap: 4 },
  reelUser:    { color: '#fff', fontWeight: '900', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  reelCareer:  { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700' },
  reelCaption: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20, marginTop: 2 },

  fab:         { position: 'absolute', bottom: 100, right: 16, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
});
