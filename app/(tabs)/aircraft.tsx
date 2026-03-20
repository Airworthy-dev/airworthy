import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { formatDate } from '@/utils/dates';

const STATUS_CONFIG = {
  airworthy: { label: 'Airworthy', colorKey: 'success' as const },
  maintenance: { label: 'In Maintenance', colorKey: 'warning' as const },
  grounded: { label: 'Grounded', colorKey: 'danger' as const },
};

export default function AircraftScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { aircraft } = useStore();

  const [search, setSearch] = useState('');

  const filtered = aircraft.filter((ac) => {
    const q = search.toLowerCase();
    return !q || ac.tail.toLowerCase().includes(q) || ac.make.toLowerCase().includes(q) || ac.model.toLowerCase().includes(q);
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Text style={s.title}>Aircraft</Text>
        <TouchableOpacity style={s.newButton} onPress={() => router.push('/aircraft/new')}>
          <Text style={s.newButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <TextInput style={s.searchInput} placeholder="Search by tail number or make…" placeholderTextColor={colors.subtext} value={search} onChangeText={setSearch} />
      </View>

      <View style={s.summaryRow}>
        {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG.airworthy][]).map(([key, cfg]) => {
          const count = aircraft.filter((a) => a.status === key).length;
          return (
            <View key={key} style={[s.summaryPill, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
              <Text style={[s.summaryCount, { color: colors[cfg.colorKey] }]}>{count}</Text>
              <Text style={[s.summaryLabel, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((ac) => {
          const cfg = STATUS_CONFIG[ac.status];
          return (
            <TouchableOpacity key={ac.id} style={s.card} activeOpacity={0.7} onPress={() => router.push(`/aircraft/${ac.id}`)}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.tailNumber}>{ac.tail}</Text>
                  <Text style={s.makeModel}>{ac.year} {ac.make} {ac.model}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
                  <Text style={[s.badgeText, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={s.divider} />
              <View style={s.detailsRow}>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Total Time</Text>
                  <Text style={s.detailValue}>{ac.totalTime.toLocaleString()} hrs</Text>
                </View>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Last Inspection</Text>
                  <Text style={s.detailValue}>{formatDate(ac.lastInspection)}</Text>
                </View>
                <View style={s.detail}>
                  <Text style={s.detailLabel}>Next Due</Text>
                  <Text style={s.detailValue}>{formatDate(ac.nextDue)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    title: { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
    newButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    newButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
    searchInput: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    summaryPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
    summaryCount: { fontSize: 16, fontWeight: '700' },
    summaryLabel: { fontSize: 11, fontWeight: '600' },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
    card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    tailNumber: { fontSize: 18, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
    makeModel: { fontSize: 14, color: colors.subtext, marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detail: { alignItems: 'flex-start' },
    detailLabel: { fontSize: 11, color: colors.subtext, fontWeight: '500', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
    detailValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  });
