import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { WorkOrder, WorkOrderStatus } from '@/store/types';
import { formatDate } from '@/utils/dates';

const STATUS_OPTIONS: WorkOrderStatus[] = ['open', 'in-progress', 'complete'];
const STATUS_LABELS: Record<WorkOrderStatus, string> = { open: 'Open', 'in-progress': 'In Progress', complete: 'Complete' };
const STATUS_COLORS: Record<WorkOrderStatus, 'danger' | 'warning' | 'success'> = { open: 'danger', 'in-progress': 'warning', complete: 'success' };

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { workOrders, updateWorkOrder, deleteWorkOrder } = useStore();

  const wo = workOrders.find((w) => w.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<WorkOrder | null>(null);

  useEffect(() => {
    if (wo) setForm({ ...wo });
  }, [wo]);

  if (!wo || !form) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.empty}><Text style={s.emptyText}>Work order not found</Text></View>
      </SafeAreaView>
    );
  }

  const colorKey = STATUS_COLORS[wo.status];

  const handleSave = () => {
    updateWorkOrder(id!, form);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Work Order', `Delete ${wo.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteWorkOrder(id!); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Status & ID */}
        <View style={s.topRow}>
          <Text style={s.woId}>{wo.id}</Text>
          <View style={[s.statusBadge, { backgroundColor: colors[`${colorKey}Light`] }]}>
            <Text style={[s.statusText, { color: colors[colorKey] }]}>{STATUS_LABELS[wo.status]}</Text>
          </View>
        </View>

        {editing ? (
          <>
            <Field label="Description">
              <TextInput style={s.input} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Tail Number">
              <TextInput style={s.input} value={form.tail} onChangeText={(v) => setForm({ ...form, tail: v.toUpperCase() })} autoCapitalize="characters" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Mechanic">
              <TextInput style={s.input} value={form.mechanic} onChangeText={(v) => setForm({ ...form, mechanic: v })} placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Date (YYYY-MM-DD)">
              <TextInput style={s.input} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="2026-03-18" placeholderTextColor={colors.subtext} />
            </Field>
            <Field label="Status">
              <View style={s.optionRow}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt} style={[s.optionChip, form.status === opt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setForm({ ...form, status: opt })}>
                    <Text style={[s.optionChipText, form.status === opt && { color: '#fff' }]}>{STATUS_LABELS[opt]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Notes">
              <TextInput style={[s.input, s.textarea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline numberOfLines={4} placeholder="Optional notes…" placeholderTextColor={colors.subtext} />
            </Field>
            <View style={s.buttonRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setForm({ ...wo }); setEditing(false); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <InfoRow label="Description" value={wo.description} colors={colors} s={s} />
            <InfoRow label="Aircraft" value={wo.tail} colors={colors} s={s} accent onPress={() => router.push(`/aircraft/${wo.tail}`)} />
            <InfoRow label="Mechanic" value={wo.mechanic} colors={colors} s={s} />
            <InfoRow label="Date" value={formatDate(wo.date)} colors={colors} s={s} />
            {wo.notes ? <InfoRow label="Notes" value={wo.notes} colors={colors} s={s} /> : null}
            <View style={s.buttonRow}>
              <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
                <Text style={s.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, colors, s, accent, onPress }: { label: string; value: string; colors: any; s: any; accent?: boolean; onPress?: () => void }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <TouchableOpacity disabled={!onPress} onPress={onPress}>
        <Text style={[s.infoValue, accent && { color: colors.primary }]}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    woId: { fontSize: 22, fontWeight: '700', color: colors.primary },
    statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: 14, fontWeight: '600' },
    infoRow: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    infoLabel: { fontSize: 13, color: colors.subtext, fontWeight: '500' },
    infoValue: { fontSize: 15, fontWeight: '600', color: colors.text },
    input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    textarea: { height: 100, textAlignVertical: 'top' },
    optionRow: { flexDirection: 'row', gap: 8 },
    optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    optionChipText: { fontSize: 13, fontWeight: '500', color: colors.subtext },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    editBtn: { flex: 1, backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    editBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
    deleteBtn: { flex: 1, backgroundColor: colors.dangerLight, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 16 },
    saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    cancelBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { color: colors.subtext, fontWeight: '600', fontSize: 16 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 16, color: '#5A6A7A' },
  });
