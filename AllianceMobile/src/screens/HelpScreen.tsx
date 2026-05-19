import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

const FAQS = [
  { q: '¿Cómo edito mi perfil?', a: 'Ve a la pestaña Perfil y toca "Editar Perfil". Puedes actualizar tu bio, skills y foto.' },
  { q: '¿Cómo me postulo a una vacante?', a: 'En la sección Empleos, encuentra la vacante de tu interés y toca el botón "Postularme".' },
  { q: '¿Cómo envío un mensaje?', a: 'Desde Mi Red, toca el ícono de chat en la tarjeta del usuario. O abre directamente la pestaña Mensajes.' },
  { q: '¿Qué son los Reels?', a: 'Son videos cortos de la comunidad Javeriana mostrando proyectos, logros y tips de ingeniería.' },
  { q: '¿Cómo conecto con alguien?', a: 'En Mi Red, toca "Conectar" en el perfil del ingeniero. Recibirá una solicitud de conexión.' },
  { q: '¿Alliance es solo para la Javeriana?', a: 'Actualmente sí. Es una plataforma exclusiva para la comunidad de ingeniería de la Pontificia Universidad Javeriana Cali.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity onPress={() => setOpen((p) => !p)} style={styles.faqItem} activeOpacity={0.8}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqArrow}>{open ? '▲' : '▼'}</Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </TouchableOpacity>
  );
}

export function HelpScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Centro de Ayuda 🆘</Text>

        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <View>
            <Text style={styles.heroTitle}>¿Cómo podemos ayudarte?</Text>
            <Text style={styles.heroSub}>Encuentra respuestas a tus preguntas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿Necesitas más ayuda?</Text>
          <Text style={styles.contactText}>Escríbenos a soporte@alliance.javeriana.edu.co y te respondemos en menos de 24 horas.</Text>
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
            <Text style={styles.contactBtnText}>Enviar mensaje</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.mint },
  scroll:        { padding: 20, paddingBottom: 120 },
  pageTitle:     { fontSize: 24, fontWeight: '900', color: Colors.textDark, marginBottom: 20 },
  heroBanner:    { backgroundColor: '#FFF3E0', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  heroEmoji:     { fontSize: 40 },
  heroTitle:     { fontWeight: '800', fontSize: 16, color: Colors.textDark },
  heroSub:       { fontSize: 13, color: Colors.textGray, marginTop: 2 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 14 },
  faqList:       { gap: 10, marginBottom: 28 },
  faqItem:       { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  faqHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ:          { flex: 1, fontWeight: '700', fontSize: 14, color: Colors.textDark, paddingRight: 8 },
  faqArrow:      { fontSize: 12, color: Colors.primary, fontWeight: '900' },
  faqA:          { fontSize: 13, color: Colors.textGray, lineHeight: 20, marginTop: 12 },
  contactCard:   { backgroundColor: Colors.primary, borderRadius: 20, padding: 24, gap: 12, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  contactTitle:  { fontSize: 18, fontWeight: '900', color: '#fff' },
  contactText:   { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  contactBtn:    { backgroundColor: Colors.lime, borderRadius: 14, padding: 14, alignItems: 'center' },
  contactBtnText:{ fontWeight: '900', fontSize: 14, color: Colors.textDark, textTransform: 'uppercase', letterSpacing: 0.5 },
});
