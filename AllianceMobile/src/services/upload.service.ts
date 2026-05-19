import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, TOKEN_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function uploadToServer(uri: string, mimeType: string, fileName: string): Promise<{ url: string; public_id: string }> {
  const token = await getToken();
  const form = new FormData();
  form.append('file', { uri, type: mimeType, name: fileName } as any);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function pickAndUploadAvatar(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const ext = asset.uri.split('.').pop() ?? 'jpg';
  const { url } = await uploadToServer(asset.uri, `image/${ext}`, `avatar.${ext}`);

  const token = await getToken();
  await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
    body: JSON.stringify({ profilePicture: url }),
  });

  return url;
}

export async function pickAndUploadPostImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const ext = asset.uri.split('.').pop() ?? 'jpg';
  const { url } = await uploadToServer(asset.uri, `image/${ext}`, `post.${ext}`);
  return url;
}

export async function pickAndUploadStory(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });
  if (result.canceled) return null;

  const token = await getToken();
  const asset = result.assets[0];
  const ext = asset.uri.split('.').pop() ?? 'jpg';
  const form = new FormData();
  form.append('file', { uri: asset.uri, type: `image/${ext}`, name: `story.${ext}` } as any);

  const res = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: form,
  });
  if (!res.ok) throw new Error('Error subiendo historia');
  const data = await res.json();
  return data.mediaUrl ?? null;
}

export async function pickAndUploadReel(caption: string): Promise<boolean> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return false;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: 0.7,
  });
  if (result.canceled) return false;

  const token = await getToken();
  const asset = result.assets[0];
  const form = new FormData();
  form.append('file', { uri: asset.uri, type: 'video/mp4', name: 'reel.mp4' } as any);
  if (caption) form.append('caption', caption);

  const res = await fetch(`${BASE_URL}/reels`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: form,
  });
  return res.ok;
}
