import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { Urgency } from '@/store/types';
import { daysLabel, daysUntil, formatDate, urgencyFromDays } from '@/utils/dates';

const URGENCY_CONFIG = {
  overdue: { label: 'Overdue', colorKey: 'danger' as const, accent: '#C62828' },
  soon: { label: 'Due Soon', colorKey: 'warning' as const, accent: '#E65100' },
  upcoming: { label: 'Upcoming', colorKey: 'primary' as const, accent: '#1565C0' },
};

const CATEGORY_FILTERS = ['All', 'Inspection', 'Avionics', 'Engine', 'Equipment'];

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { reminders } = useStore();

  const [categoryFilter, setCategoryFilter] = useState('All');

  const enriched = reminders.map((r) => {
    const days = daysUntil(r.dueDate);
    return { ...r, days, urgency: urgencyFromDays(days) as Urgency };
  });

  const filtered = enriched.filter((r) => categoryFilter === 'All' || r.category === categoryFilter);

  const grouped: Record<Urgency, typeof filtered> = {
    overdue: filtered.filter((r) => r.urgency === 'overdue'),
    soon: filtered.filter((r) => r.urgency === 'soon'),
    upcoming: filtered.filter((r) => r.urgency === 'upcoming'),
  };

  const renderGroup = (urgency: Urgency) => {
    const items = grouped[urgency];
    if (items.length === 0) return null;
    const cfg = URGENCY_CONFIG[urgency];
    return (
      <View key={urgency} style={s.group}>
        <View style={s.groupHeader}>
          <View style={[s.groupDot, { backgroundColor: cfg.accent }]} />
          <Text style={[s.groupTitle, { color: cfg.accent }]}>{cfg.label}</Text>
          <View style={[s.groupCount, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
            <Text style={[s.groupCountText, { color: colors[cfg.colorKey] }]}>{items.length}</Text>
          </View>
        </View>
        {items.map((r) => (
          <TouchableOpacity key={r.id} style={[s.card, { borderLeftColor: cfg.accent }]} activeOpacity={0.7} onPress={() => router.push(`/reminder/${r.id}`)}>
            <View style={s.cardTop}>
              <View style={s.cardLeft}>
                <Text style={s.cardType}>{r.type}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.cardTail}>{r.tail}</Text>
                  <Text style={s.cardDot}>·</Text>
                  <View style={s.categoryPill}>
                    <Text style={s.categoryText}>{r.category}</Text>
                  </View>
                </View>
              </View>
              <View style={s.cardRight}>
                <Text style={[s.daysLabel, { color: cfg.accent }]}>{daysLabel(r.days)}</Text>
                <Text style={s.dueDate}>{formatDate(r.dueDate)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Text style={s.title}>Reminders</Text>
        <TouchableOpacity style={s.newButton} onPress={() => router.push('/reminder/new')}>
          <Text style={s.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={s.summaryRow}>
        {(Object.entries(URGENCY_CONFIG) as [Urgency, typeof URGENCY_CONFIG.overdue][]).map(([key, cfg]) => {
          const count = enriched.filter((r) => r.urgency === key).length;
          return (
            <View key={key} style={[s.summaryCard, { borderTopColor: cfg.accent }]}>
              <Text style={[s.summaryCount, { color: cfg.accent }]}>{count}</Text>
              <Text style={s.summaryLabel}>{cfg.label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
        {CATEGORY_FILTERS.map((cat) => (
          <TouchableOpacity key={cat} style={[s.filterChip, categoryFilter === cat && s.filterChipActive]} onPress={() => setCategoryFilter(cat)}>
            <Text style={[s.filterChipText, categoryFilter === cat && s.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {(['overdue', 'soon', 'upcoming'] as Urgency[]).map(renderGroup)}
        {filtered.length === 0 && (
          <View style={s.empty}><Text style={s.emptyText}>No reminders found</Text></View>
        )}
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
    summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
    summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 12, alignItems: 'center', borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    summaryCount: { fontSize: 22, fontWeight: '700' },
    summaryLabel: { fontSize: 11, color: colors.subtext, fontWeight: '500', marginTop: 2 },
    filterRow: { flexGrow: 0 },
    filterContent: { paddingHorizontal: 20, paddingVertical: 6, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 13, fontWeight: '500', color: colors.subtext },
    filterChipTextActive: { color: '#fff' },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
    group: { marginBottom: 20 },
    groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    groupDot: { width: 8, height: 8, borderRadius: 4 },
    groupTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    groupCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    groupCountText: { fontSize: 12, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardLeft: { flex: 1, marginRight: 12 },
    cardType: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardTail: { fontSize: 13, fontWeight: '600', color: colors.accent },
    cardDot: { color: colors.border, fontSize: 13 },
    categoryPill: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: '600', color: colors.primary },
    cardRight: { alignItems: 'flex-end' },
    daysLabel: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
    dueDate: { fontSize: 12, color: colors.subtext },
    empty: { paddingTop: 60, alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.subtext },
  });
