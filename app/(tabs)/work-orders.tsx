import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { WorkOrderStatus } from '@/store/types';
import { formatDate } from '@/utils/dates';

type FilterValue = WorkOrderStatus | 'all' | 'this-month';

const STATUS_CONFIG = {
  open: { label: 'Open', colorKey: 'danger' as const },
  'in-progress': { label: 'In Progress', colorKey: 'warning' as const },
  complete: { label: 'Complete', colorKey: 'success' as const },
};

function isThisMonth(dateISO: string) {
  const d = new Date(dateISO + 'T00:00:00');
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function WorkOrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { workOrders } = useStore();

  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');

  const counts = {
    all: workOrders.length,
    open: workOrders.filter((w) => w.status === 'open').length,
    'in-progress': workOrders.filter((w) => w.status === 'in-progress').length,
    complete: workOrders.filter((w) => w.status === 'complete').length,
    'this-month': workOrders.filter((w) => w.status !== 'complete' && isThisMonth(w.date)).length,
  };

  const FILTER_CARDS: { label: string; sublabel: string; value: FilterValue; colorKey: keyof typeof colors }[] = [
    { label: String(counts.all), sublabel: 'All', value: 'all', colorKey: 'primary' },
    { label: String(counts.open), sublabel: 'Open', value: 'open', colorKey: 'danger' },
    { label: String(counts['in-progress']), sublabel: 'In Progress', value: 'in-progress', colorKey: 'warning' },
    { label: String(counts.complete), sublabel: 'Complete', value: 'complete', colorKey: 'success' },
    { label: String(counts['this-month']), sublabel: 'This Month', value: 'this-month', colorKey: 'accent' },
  ];

  const filtered = workOrders.filter((wo) => {
    let matchesFilter = true;
    if (filter === 'this-month') matchesFilter = wo.status !== 'complete' && isThisMonth(wo.date);
    else if (filter !== 'all') matchesFilter = wo.status === filter;

    const q = search.toLowerCase();
    const matchesSearch = !q || wo.id.toLowerCase().includes(q) || wo.tail.toLowerCase().includes(q) || wo.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const activeCard = FILTER_CARDS.find((f) => f.value === filter)!;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Text style={s.title}>Work Orders</Text>
        <TouchableOpacity style={s.newButton} onPress={() => router.push('/work-order/new')}>
          <Text style={s.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterCards}>
        {FILTER_CARDS.map((f) => {
          const active = filter === f.value;
          const color = colors[f.colorKey] as string;
          return (
            <TouchableOpacity
              key={f.value}
              style={[s.filterCard, active && { borderColor: color, borderWidth: 2 }]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}>
              <Text style={[s.filterCardCount, { color: active ? color : colors.text }]}>{f.label}</Text>
              <Text style={[s.filterCardLabel, { color: active ? color : colors.subtext }]}>{f.sublabel}</Text>
              {active && <View style={[s.filterCardDot, { backgroundColor: color }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active filter label + search */}
      <View style={s.searchRow}>
        <View style={s.searchContainer}>
          <TextInput
            style={s.searchInput}
            placeholder={`Search ${activeCard.sublabel.toLowerCase()} work orders…`}
            placeholderTextColor={colors.subtext}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No {activeCard.sublabel.toLowerCase()} work orders</Text>
          </View>
        ) : (
          filtered.map((wo) => {
            const cfg = STATUS_CONFIG[wo.status];
            return (
              <TouchableOpacity key={wo.id} style={s.card} activeOpacity={0.7} onPress={() => router.push(`/work-order/${wo.id}`)}>
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
                  <Text style={s.cardMetaText}>{formatDate(wo.date)}</Text>
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
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    title: { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
    newButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    newButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    filterCards: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
    filterCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, minWidth: 90, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    filterCardCount: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
    filterCardLabel: { fontSize: 11, fontWeight: '600' },
    filterCardDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6 },
    searchRow: { paddingHorizontal: 20, marginBottom: 8 },
    searchContainer: { flex: 1 },
    searchInput: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
    card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardId: { fontSize: 13, fontWeight: '600', color: colors.primary },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    cardDescription: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardTail: { fontSize: 13, fontWeight: '600', color: colors.accent },
    cardDot: { fontSize: 13, color: colors.border },
    cardMetaText: { fontSize: 13, color: colors.subtext },
    empty: { paddingTop: 60, alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.subtext },
  });
