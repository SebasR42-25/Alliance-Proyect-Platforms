import React, { useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text, Image,
  TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Banner } from '../components/layout/Banner';
import { getCompanies } from '../services/companies.service';
import type { Company } from '../types';

const LOGO_DEV_TOKEN = 'pk_LjNjFs4cQeKpU2apVf1fSA';

const DOMAIN_MAP: Record<string, string> = {
  globant: 'globant.com', rappi: 'rappi.com', telefonica: 'telefonica.com',
  google: 'google.com', amazon: 'amazon.com', microsoft: 'microsoft.com',
  mercadolibre: 'mercadolibre.com', bancolombia: 'bancolombia.com.co',
  epam: 'epam.com', accenture: 'accenture.com', deloitte: 'deloitte.com',
};

function getLogoUrl(company: Company): string | null {
  if (company.logoUrl) return company.logoUrl;
  const key = company.name.toLowerCase().replace(/\s+/g, '');
  const domain = DOMAIN_MAP[key];
  if (domain) return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128`;
  return null;
}

const FALLBACK: Company[] = [
  { _id: 'c1', name: 'Globant', description: 'Empresa global de tecnología y soluciones digitales.', industry: 'Tecnología', availableJobs: 5, createdAt: '' },
  { _id: 'c2', name: 'Rappi', description: 'Superapp latinoamericana de delivery y tecnología.', industry: 'FinTech', availableJobs: 8, createdAt: '' },
  { _id: 'c3', name: 'Telefonica', description: 'Telecomunicaciones y soluciones digitales empresariales.', industry: 'Telecomunicaciones', availableJobs: 2, createdAt: '' },
  { _id: 'c4', name: 'Mercadolibre', description: 'E-commerce y fintech líder de Latinoamérica.', industry: 'E-commerce', availableJobs: 12, createdAt: '' },
  { _id: 'c5', name: 'Bancolombia', description: 'Banco líder en Colombia con transformación digital.', industry: 'Banca', availableJobs: 6, createdAt: '' },
];

function CompanyLogo({ company }: { company: Company }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getLogoUrl(company);

  if (logoUrl && !imgError) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={styles.logoImg}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <View style={styles.logoFallback}>
      <Text style={styles.logoText}>{company.name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <View style={styles.card}>
      <View style={styles.logoBox}>
        <CompanyLogo company={company} />
      </View>
      <View style={styles.body}>
        <Text style={styles.compName}>{company.name}</Text>
        <Text style={styles.industry}>{company.industry ?? 'Tecnología'}</Text>
        {company.description && (
          <Text style={styles.desc} numberOfLines={2}>{company.description}</Text>
        )}
        <View style={styles.footer}>
          <View style={styles.jobsBadge}>
            <MaterialCommunityIcons name="briefcase-outline" size={12} color={Colors.success} />
            <Text style={styles.jobsText}>{company.availableJobs} vacantes</Text>
          </View>
          <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
            <Text style={styles.followText}>Seguir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function CompaniesScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filtered, setFiltered]   = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);
  const [query, setQuery]         = useState('');

  const load = async (refresh = false) => {
    if (refresh) setRefresh(true); else setLoading(true);
    try {
      const data = await getCompanies();
      const list = data.length > 0 ? data : FALLBACK;
      setCompanies(list);
      setFiltered(list);
    } catch {
      setCompanies(FALLBACK);
      setFiltered(FALLBACK);
    } finally { setLoading(false); setRefresh(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const q = text.toLowerCase().trim();
    if (!q) { setFiltered(companies); return; }
    setFiltered(companies.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.industry ?? '').toLowerCase().includes(q)
    ));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(c) => c._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Empresas</Text>
            <Banner title="Empresas que contratan hoy" subtitle="Postulate directamente desde Alliance" cta="Ver vacantes" variant="pink" />
            <View style={styles.searchRow}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors.textGray} style={{ marginLeft: 14 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar empresa o industria..."
                placeholderTextColor={Colors.textLight}
                value={query}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')} style={{ paddingRight: 14 }}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 12 }}>{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</View>
          ) : (
            <View style={styles.noResults}>
              <MaterialCommunityIcons name="office-building-off-outline" size={48} color={Colors.cardBorder} />
              <Text style={styles.noResultsText}>Sin resultados para "{query}"</Text>
            </View>
          )
        }
        renderItem={({ item }) => <CompanyCard company={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.mint },
  list:        { padding: 16, paddingBottom: 100 },
  header:      { gap: 14, marginBottom: 16 },
  pageTitle:   { fontSize: 24, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.cardBorder, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  searchInput: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 14, color: Colors.textDark },
  card:        { backgroundColor: Colors.white, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, flexDirection: 'row', gap: 14 },
  logoBox:     { width: 56, height: 56, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.inputBg, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  logoImg:     { width: 56, height: 56, borderRadius: 16 },
  logoFallback:{ width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  logoText:    { fontSize: 24, fontWeight: '900', color: Colors.primary },
  body:        { flex: 1, gap: 3 },
  compName:    { fontWeight: '800', fontSize: 16, color: Colors.textDark },
  industry:    { fontSize: 12, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  desc:        { fontSize: 13, color: Colors.textGray, lineHeight: 19 },
  footer:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  jobsBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  jobsText:    { fontSize: 12, color: Colors.success, fontWeight: '700' },
  followBtn:   { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  followText:  { color: '#fff', fontWeight: '800', fontSize: 12 },
  noResults:   { alignItems: 'center', gap: 10, paddingTop: 40 },
  noResultsText: { fontSize: 14, color: Colors.textGray, fontWeight: '600' },
});
