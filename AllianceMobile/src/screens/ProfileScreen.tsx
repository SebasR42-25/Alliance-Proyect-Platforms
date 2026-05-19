import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { getMe, updateProfile } from '../services/users.service';
import { pickAndUploadAvatar } from '../services/upload.service';
import type { User } from '../types';

// ── Opciones de selects ───────────────────────────────────────────────────────
const SENIORITY_OPTS = ['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Principal', 'Manager', 'Director'];
const SPECIALIZATION_OPTS = [
  'Frontend Development', 'Backend Development', 'Full Stack', 'DevOps / SRE',
  'Data Science', 'Machine Learning', 'Product Management', 'UX/UI Design',
  'Cybersecurity', 'Cloud Architecture',
];
const SECTOR_OPTS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
  'Consulting', 'Media & Entertainment', 'Manufacturing', 'Government', 'NGO / Nonprofit',
];

// ── Cálculo de completitud ────────────────────────────────────────────────────
interface CompletionItem { label: string; done: boolean; section: string }

function getCompletion(p: User | null): CompletionItem[] {
  if (!p) return [];
  return [
    { label: 'Foto de perfil',       done: !!p.profilePicture,        section: 'avatar'   },
    { label: 'Nombre completo',      done: !!p.name?.trim(),           section: 'basic'    },
    { label: 'Bio profesional',      done: !!p.bio?.trim(),            section: 'basic'    },
    { label: 'Ubicación',            done: !!p.location?.trim(),       section: 'basic'    },
    { label: 'Skills (mín. 3)',      done: (p.skills?.length ?? 0) >= 3, section: 'skills' },
    { label: 'Nivel de seniority',   done: !!p.seniority,             section: 'job'      },
    { label: 'Especialización',      done: !!p.specialization,        section: 'job'      },
    { label: 'Sector',               done: !!p.sector,                section: 'job'      },
    { label: 'Primera conexión',     done: (p.connections?.length ?? 0) > 0, section: '' },
  ];
}

// ── Anillo de progreso ─────────────────────────────────────────────────────────
function ProgressRing({ pct }: { pct: number }) {
  const color = pct < 40 ? Colors.error : pct < 75 ? Colors.warning : Colors.success;
  return (
    <View style={ring.wrap}>
      <View style={[ring.outer, { borderColor: color }]}>
        <Text style={[ring.pct, { color }]}>{pct}%</Text>
        <Text style={ring.label}>completo</Text>
      </View>
    </View>
  );
}
const ring = StyleSheet.create({
  wrap:  { alignItems: 'center', justifyContent: 'center' },
  outer: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  pct:   { fontSize: 20, fontWeight: '900' },
  label: { fontSize: 9, color: Colors.textGray, fontWeight: '700', textTransform: 'uppercase' },
});

// ── Selector tipo chip ────────────────────────────────────────────────────────
function ChipSelector({ options, value, onSelect }: { options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          onPress={() => onSelect(o)}
          activeOpacity={0.75}
          style={[chip.base, value === o && chip.active]}
        >
          <Text style={[chip.text, value === o && chip.textActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const chip = StyleSheet.create({
  base:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.cardBorder, backgroundColor: Colors.white },
  active:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  text:       { fontSize: 12, fontWeight: '600', color: Colors.textGray },
  textActive: { color: '#fff', fontWeight: '800' },
});

// ── Pantalla principal ────────────────────────────────────────────────────────
type ModalType = 'basic' | 'skills' | 'job' | null;

export function ProfileScreen() {
  const { user, token, logout } = useAuthStore();
  const toast = useToast();
  const [profile, setProfile]   = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal]       = useState<ModalType>(null);

  // Form state
  const [name, setName]               = useState('');
  const [bio, setBio]                 = useState('');
  const [location, setLocation]       = useState('');
  const [seniority, setSeniority]     = useState('');
  const [specialization, setSpec]     = useState('');
  const [sector, setSector]           = useState('');
  const [skills, setSkills]           = useState<string[]>([]);
  const [newSkill, setNewSkill]       = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const p = await getMe(token);
      setProfile(p);
      // Sync form
      setName(p.name ?? '');
      setBio(p.bio ?? '');
      setLocation(p.location ?? '');
      setSeniority(p.seniority ?? '');
      setSpec(p.specialization ?? '');
      setSector(p.sector ?? '');
      setSkills(p.skills ?? []);
    } catch { toast.error('Error cargando perfil'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, []);

  // ── Guardar sección ──────────────────────────────────────────────────────
  const save = async (data: Partial<User>) => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateProfile(token, data);
      setProfile(updated);
      setModal(null);
      toast.success('Perfil actualizado ✓');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err.message ?? 'Error guardando');
    } finally { setSaving(false); }
  };

  const saveBasic = () => save({ name: name.trim(), bio: bio.trim(), location: location.trim() });
  const saveJob   = () => save({ seniority, specialization, sector });
  const saveSkills = () => {
    if (skills.length < 3) { toast.error('Agrega al menos 3 skills'); return; }
    save({ skills });
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || skills.includes(s)) return;
    setSkills(p => [...p, s]);
    setNewSkill('');
  };

  const removeSkill = (s: string) => setSkills(p => p.filter(x => x !== s));

  // ── Avatar ───────────────────────────────────────────────────────────────
  const handleAvatar = async () => {
    setUploading(true);
    try {
      const url = await pickAndUploadAvatar();
      if (url) { setProfile(p => p ? { ...p, profilePicture: url } : p); toast.success('Foto actualizada ✓'); }
    } catch { toast.error('Error subiendo la foto'); }
    finally { setUploading(false); }
  };

  const handleLogout = () =>
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); } },
    ]);

  // ── Completitud ──────────────────────────────────────────────────────────
  const completion  = getCompletion(profile);
  const donePct     = Math.round((completion.filter(c => c.done).length / completion.length) * 100);
  const progressColor = donePct < 40 ? Colors.error : donePct < 75 ? Colors.warning : Colors.success;

  const avatarUrl = profile?.profilePicture
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=E91E8C&color=fff&size=256`;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.mint }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Banner + Avatar ─────────────────────────────────────────── */}
        <View style={styles.banner}>
          <View style={styles.bannerGrad} />
          <TouchableOpacity onPress={handleAvatar} disabled={uploading} style={styles.avatarWrap} activeOpacity={0.85}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.cameraBtn}>
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <MaterialCommunityIcons name="camera" size={14} color="#fff" />
              }
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Info nombre ─────────────────────────────────────────────── */}
        <View style={styles.nameSection}>
          <Text style={styles.userName}>{profile?.name ?? user?.name}</Text>
          {(profile?.seniority || profile?.specialization) && (
            <Text style={styles.userTitle}>
              {[profile.seniority, profile.specialization].filter(Boolean).join(' · ')}
            </Text>
          )}
          {profile?.location && (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textGray} />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}
          {profile?.sector && (
            <View style={styles.sectorBadge}>
              <Text style={styles.sectorText}>{profile.sector}</Text>
            </View>
          )}
        </View>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile?.connections?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Conexiones</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile?.skills?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <ProgressRing pct={donePct} />
          </View>
        </View>

        {/* ── Progreso de perfil ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-line" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Completa tu perfil</Text>
            <Text style={[styles.pctLabel, { color: progressColor }]}>{donePct}%</Text>
          </View>
          {/* Barra */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${donePct}%` as any, backgroundColor: progressColor }]} />
          </View>
          {/* Items */}
          <View style={styles.completionList}>
            {completion.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.completionItem}
                activeOpacity={item.section ? 0.7 : 1}
                onPress={() => item.section && setModal(item.section as ModalType)}
              >
                <View style={[styles.checkCircle, item.done && styles.checkDone]}>
                  <MaterialCommunityIcons
                    name={item.done ? 'check' : 'plus'}
                    size={12}
                    color={item.done ? '#fff' : Colors.textLight}
                  />
                </View>
                <Text style={[styles.completionLabel, item.done && styles.completionDone]}>
                  {item.label}
                </Text>
                {!item.done && item.section && (
                  <Text style={styles.completionAction}>Completar →</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Bio ─────────────────────────────────────────────────────── */}
        {profile?.bio ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="text-account" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Sobre mí</Text>
              <TouchableOpacity onPress={() => setModal('basic')} style={styles.editIcon}>
                <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* ── Skills ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="tag-multiple-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Skills</Text>
            <TouchableOpacity onPress={() => setModal('skills')} style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {(profile?.skills?.length ?? 0) > 0 ? (
            <View style={styles.skillsWrap}>
              {profile!.skills.map(s => (
                <View key={s} style={styles.skillChip}>
                  <Text style={styles.skillText}>#{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity onPress={() => setModal('skills')} style={styles.emptySection} activeOpacity={0.8}>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.emptySectionText}>Añade tus habilidades técnicas</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Perfil Profesional ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="briefcase-account-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Perfil Profesional</Text>
            <TouchableOpacity onPress={() => setModal('job')} style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {(profile?.seniority || profile?.specialization || profile?.sector) ? (
            <View style={{ gap: 10 }}>
              {profile?.seniority && (
                <View style={styles.jobRow}>
                  <MaterialCommunityIcons name="stairs-up" size={16} color={Colors.primary} />
                  <Text style={styles.jobLabel}>Nivel</Text>
                  <Text style={styles.jobValue}>{profile.seniority}</Text>
                </View>
              )}
              {profile?.specialization && (
                <View style={styles.jobRow}>
                  <MaterialCommunityIcons name="code-braces" size={16} color={Colors.primary} />
                  <Text style={styles.jobLabel}>Especialización</Text>
                  <Text style={styles.jobValue}>{profile.specialization}</Text>
                </View>
              )}
              {profile?.sector && (
                <View style={styles.jobRow}>
                  <MaterialCommunityIcons name="domain" size={16} color={Colors.primary} />
                  <Text style={styles.jobLabel}>Sector</Text>
                  <Text style={styles.jobValue}>{profile.sector}</Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity onPress={() => setModal('job')} style={styles.emptySection} activeOpacity={0.8}>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.emptySectionText}>Agrega tu información profesional</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Acciones ─────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setModal('basic')} style={styles.editBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="account-edit-outline" size={18} color="#fff" />
            <Text style={styles.editText}>Editar Información Básica</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="logout" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Información Básica
      ══════════════════════════════════════════════════════════════════ */}
      <Modal visible={modal === 'basic'} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Información Básica</Text>

            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Tu nombre" placeholderTextColor={Colors.textLight} />

            <Text style={styles.fieldLabel}>Bio profesional</Text>
            <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio}
              placeholder="Cuéntanos sobre ti y tu trayectoria..." placeholderTextColor={Colors.textLight}
              multiline numberOfLines={4} textAlignVertical="top" />

            <Text style={styles.fieldLabel}>Ubicación</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation}
              placeholder="Ej: Cali, Colombia" placeholderTextColor={Colors.textLight} />

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModal(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveBasic} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Skills
      ══════════════════════════════════════════════════════════════════ */}
      <Modal visible={modal === 'skills'} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Skills</Text>
            <Text style={styles.modalSubtitle}>Agrega al menos 3 habilidades técnicas</Text>

            {/* Input para agregar */}
            <View style={styles.skillInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Ej: React Native, NestJS..."
                placeholderTextColor={Colors.textLight}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={addSkill} style={styles.addSkillBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Chips de skills */}
            <View style={styles.skillsWrap}>
              {skills.map(s => (
                <TouchableOpacity key={s} onPress={() => removeSkill(s)} style={styles.skillChipEdit} activeOpacity={0.8}>
                  <Text style={styles.skillText}>#{s}</Text>
                  <MaterialCommunityIcons name="close" size={12} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
            {skills.length < 3 && (
              <Text style={styles.skillHint}>
                <MaterialCommunityIcons name="information-outline" size={12} color={Colors.warning} />
                {` Necesitas ${3 - skills.length} skill(s) más`}
              </Text>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModal(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSkills} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL — Perfil Profesional
      ══════════════════════════════════════════════════════════════════ */}
      <Modal visible={modal === 'job'} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.modalOverlay} keyboardShouldPersistTaps="handled">
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Perfil Profesional</Text>

            <Text style={styles.fieldLabel}>Nivel de Seniority</Text>
            <ChipSelector options={SENIORITY_OPTS} value={seniority} onSelect={setSeniority} />

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Especialización</Text>
            <ChipSelector options={SPECIALIZATION_OPTS} value={specialization} onSelect={setSpec} />

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Sector</Text>
            <ChipSelector options={SECTOR_OPTS} value={sector} onSelect={setSector} />

            <View style={[styles.modalBtns, { marginTop: 24 }]}>
              <TouchableOpacity onPress={() => setModal(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveJob} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.mint },
  scroll:  { paddingBottom: 120 },

  // Banner
  banner:      { height: 140, backgroundColor: Colors.primary, position: 'relative' },
  bannerGrad:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  avatarWrap:  { position: 'absolute', bottom: -44, left: 20, borderRadius: 24, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  avatar:      { width: 86, height: 86, borderRadius: 20 },
  cameraBtn:   { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },

  // Nombre
  nameSection:  { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, gap: 4 },
  userName:     { fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  userTitle:    { fontSize: 13, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, color: Colors.textGray, fontWeight: '600' },
  sectorBadge:  { alignSelf: 'flex-start', backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  sectorText:   { fontSize: 11, color: Colors.primary, fontWeight: '700' },

  // Stats
  statsRow:  { flexDirection: 'row', marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 16 },
  stat:      { flex: 1, alignItems: 'center' },
  statNum:   { fontSize: 22, fontWeight: '900', color: Colors.textDark },
  statLabel: { fontSize: 10, color: Colors.textGray, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  statDiv:   { width: 1, height: 36, backgroundColor: Colors.cardBorder },

  // Card
  card:       { marginHorizontal: 16, marginBottom: 14, backgroundColor: Colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle:  { flex: 1, fontSize: 15, fontWeight: '800', color: Colors.textDark },
  editIcon:   { padding: 4 },

  // Progreso
  pctLabel:      { fontSize: 15, fontWeight: '900' },
  progressBg:    { height: 6, backgroundColor: Colors.inputBg, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 3 },
  completionList:{ gap: 8 },
  completionItem:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkCircle:   { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.inputBg },
  checkDone:     { backgroundColor: Colors.success, borderColor: Colors.success },
  completionLabel: { flex: 1, fontSize: 13, color: Colors.textGray, fontWeight: '600' },
  completionDone:  { color: Colors.textDark, textDecorationLine: 'line-through' },
  completionAction:{ fontSize: 11, color: Colors.primary, fontWeight: '800' },

  // Bio
  bioText:   { fontSize: 14, color: Colors.textGray, lineHeight: 22 },

  // Skills
  skillsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  skillChip:     { backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillChipEdit: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillText:     { fontSize: 13, fontWeight: '700', color: Colors.primary },
  skillHint:     { fontSize: 12, color: Colors.warning, fontWeight: '600', marginTop: 8 },

  // Job rows
  jobRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  jobLabel: { fontSize: 12, color: Colors.textGray, fontWeight: '600', width: 110 },
  jobValue: { flex: 1, fontSize: 13, color: Colors.textDark, fontWeight: '700' },

  // Empty section
  emptySection:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  emptySectionText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },

  // Acciones
  actions:    { paddingHorizontal: 16, gap: 12, marginTop: 4 },
  editBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, padding: 16, borderRadius: 16, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  editText:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.error + '40' },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox:     { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '90%' },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.cardBorder, alignSelf: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 20, fontWeight: '900', color: Colors.textDark, marginBottom: 4 },
  modalSubtitle:{ fontSize: 13, color: Colors.textGray, marginBottom: 16 },
  fieldLabel:   { fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 6, marginTop: 14 },
  input:        { backgroundColor: Colors.inputBg, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textDark, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 4 },
  textArea:     { minHeight: 90, textAlignVertical: 'top' },
  skillInputRow:{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16 },
  addSkillBtn:  { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalBtns:    { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  cancelText:   { fontWeight: '700', color: Colors.textGray },
  saveBtn:      { flex: 1, padding: 14, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveText:     { fontWeight: '900', color: '#fff' },
});
