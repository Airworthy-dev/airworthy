import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StatusType = 'open' | 'in-progress' | 'complete';

interface WorkOrder {
  id: string;
  tail: string;
  description: string;
  mechanic: string;
  date: string;
  status: StatusType;
}

const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-1042', tail: 'N182TW', description: '100-Hour Inspection', mechanic: 'J. Martinez', date: 'Mar 18, 2026', status: 'in-progress' },
  { id: 'WO-1041', tail: 'N44XA', description: 'Annual Inspection', mechanic: 'R. Chen', date: 'Mar 15, 2026', status: 'open' },
  { id: 'WO-1040', tail: 'N8801B', description: 'Avionics Update – G530', mechanic: 'J. Martinez', date: 'Mar 10, 2026', status: 'complete' },
  { id: 'WO-1039', tail: 'N7762C', description: 'Engine Oil Change', mechanic: 'S. Patel', date: 'Mar 8, 2026', status: 'complete' },
  { id: 'WO-1038', tail: 'N55KL', description: 'Landing Gear Inspection', mechanic: 'R. Chen', date: 'Mar 5, 2026', status: 'open' },
  { id: 'WO-1037', tail: 'N2209F', description: 'Transponder Calibration', mechanic: 'S. Patel', date: 'Feb 28, 2026', status: 'complete' },
];

const FILTERS: { label: string; value: StatusType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Complete', value: 'complete' },
];

const STATUS_CONFIG = {
  open: { label: 'Open', colorKey: 'danger' as const },
  'in-progress': { label: 'In Progress', colorKey: 'warning' as const },
  complete: { label: 'Complete', colorKey: 'success' as const },
};

export default function WorkOrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);

  const [filter, setFilter] = useState<StatusType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = WORK_ORDERS.filter((wo) => {
    const matchesFilter = filter === 'all' || wo.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      wo.id.toLowerCase().includes(q) ||
      wo.tail.toLowerCase().includes(q) ||
      wo.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Text style={s.title}>Work Orders</Text>
        <TouchableOpacity style={s.newButton}>
          <Text style={s.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          placeholder="Search by ID, tail, or description…"
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={s.filterContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.filterChip, filter === f.value && s.filterChipActive]}
            onPress={() => setFilter(f.value)}>
            <Text style={[s.filterChipText, filter === f.value && s.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No work orders found</Text>
          </View>
        ) : (
          filtered.map((wo) => {
            const cfg = STATUS_CONFIG[wo.status];
            return (
              <TouchableOpacity key={wo.id} style={s.card} activeOpacity={0.7}>
                <View style={s.cardTop}>
                  <Text style={s.cardId}>{wo.id}</Text>
                  <View style={[s.badge, { backgroundColor: colors[`${cfg.colorKey}Light`] }]}>
                    <Text style={[s.badgeText, { color: colors[cfg.colorKey] }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.cardDescription}>{wo.description}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.cardTail}>{wo.tail}</Text>
                  <Text style={s.cardDot}>·</Text>
                  <Text style={s.cardMetaText}>{wo.mechanic}</Text>
                  <Text style={s.cardDot}>·</Text>
                  <Text style={s.cardMetaText}>{wo.date}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    newButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    newButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterRow: {
      flexGrow: 0,
    },
    filterContent: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.subtext,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    cardId: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    cardDescription: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cardTail: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accent,
    },
    cardDot: {
      fontSize: 13,
      color: colors.border,
    },
    cardMetaText: {
      fontSize: 13,
      color: colors.subtext,
    },
    empty: {
      paddingTop: 60,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.subtext,
    },
  });
