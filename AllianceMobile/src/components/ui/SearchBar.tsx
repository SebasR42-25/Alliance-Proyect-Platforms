import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: { label: string; value: string }[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Buscar...', onSearch, filters, activeFilter, onFilterChange }: Props) {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => onSearch(query)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={() => onSearch(query)} activeOpacity={0.8}>
          <Text style={styles.btnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {filters && filters.length > 0 && (
        <View style={styles.filters}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => onFilterChange?.(f.value)}
              activeOpacity={0.7}
              style={[styles.chip, activeFilter === f.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeFilter === f.value && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textDark,
  },
  btn: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  btnText: { fontSize: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textGray, textTransform: 'uppercase' },
  chipTextActive: { color: '#fff' },
});
