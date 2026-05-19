import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import type { Job, Company } from '../../types';

interface Props extends Job {
  onApply: (id: string) => void;
  onSave:  (id: string) => void;
}

const LOGO_DEV_TOKEN = 'pk_LjNjFs4cQeKpU2apVf1fSA';

const DOMAIN_MAP: Record<string, string> = {
  globant: 'globant.com', rappi: 'rappi.com', telefonica: 'telefonica.com',
  google: 'google.com', amazon: 'amazon.com', microsoft: 'microsoft.com',
  mercadolibre: 'mercadolibre.com', bancolombia: 'bancolombia.com.co',
  epam: 'epam.com', accenture: 'accenture.com', deloitte: 'deloitte.com',
  apple: 'apple.com', meta: 'meta.com', netflix: 'netflix.com',
  uber: 'uber.com', airbnb: 'airbnb.com', spotify: 'spotify.com',
};

function getLogoUrl(company: Company | string): string | null {
  if (typeof company === 'string') return null;
  if (company.logoUrl) return company.logoUrl;
  const key = company.name.toLowerCase().replace(/[\s\-_.]/g, '');
  const domain = DOMAIN_MAP[key];
  if (domain) return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128`;
  return null;
}

function CompanyLogo({ company }: { company: Company | string }) {
  const [error, setError] = useState(false);
  const name = typeof company === 'string' ? company : company?.name ?? '?';
  const logoUrl = getLogoUrl(company);

  if (logoUrl && !error) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={styles.logoImg}
        onError={() => setError(true)}
      />
    );
  }
  return (
    <View style={styles.logoFallback}>
      <Text style={styles.logoFallbackText}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function JobCard({ _id, title, company, location, salaryRange, description, tags, applicants, onApply, onSave }: Props) {
  const companyName = typeof company === 'string' ? company : company?.name ?? 'Empresa';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <CompanyLogo company={company} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.company}>{companyName}</Text>
        </View>
        <TouchableOpacity onPress={() => onSave(_id)} style={styles.save} activeOpacity={0.7}>
          <MaterialCommunityIcons name="bookmark-outline" size={22} color={Colors.textGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="map-marker-outline" size={12} color={Colors.textGray} />
          <Text style={styles.badgeText}>{location}</Text>
        </View>
        {salaryRange && (
          <View style={[styles.badge, styles.salaryBadge]}>
            <MaterialCommunityIcons name="cash-multiple" size={12} color={Colors.success} />
            <Text style={styles.salaryText}>{salaryRange}</Text>
          </View>
        )}
      </View>

      {description && <Text style={styles.desc} numberOfLines={2}>{description}</Text>}

      {tags?.length > 0 && (
        <View style={styles.tags}>
          {tags.map((t) => <Text key={t} style={styles.tag}>#{t}</Text>)}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.applicants}>{applicants?.length ?? 0} postulantes</Text>
        <TouchableOpacity onPress={() => onApply(_id)} style={styles.applyBtn} activeOpacity={0.8}>
          <Text style={styles.applyText}>Postularme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logoBox:          { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', flexShrink: 0 },
  logoImg:          { width: 48, height: 48, borderRadius: 14 },
  logoFallback:     { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  logoFallbackText: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  titleBlock:       { flex: 1 },
  title:            { fontWeight: '800', fontSize: 15, color: Colors.textDark, lineHeight: 20 },
  company:          { fontSize: 13, color: Colors.textGray, fontWeight: '600', marginTop: 2 },
  save:             { padding: 6 },
  badges:           { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  badge:            { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.inputBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText:        { fontSize: 12, color: Colors.textGray, fontWeight: '600' },
  salaryBadge:      { backgroundColor: '#F0FDF4' },
  salaryText:       { fontSize: 12, color: Colors.success, fontWeight: '700' },
  desc:             { fontSize: 13, color: Colors.textGray, lineHeight: 20, marginBottom: 10 },
  tags:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag:              { fontSize: 11, color: Colors.primary, fontWeight: '700', backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  footer:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 12 },
  applicants:       { fontSize: 12, color: Colors.textGray, fontWeight: '600' },
  applyBtn:         { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  applyText:        { color: '#fff', fontWeight: '800', fontSize: 13 },
});
