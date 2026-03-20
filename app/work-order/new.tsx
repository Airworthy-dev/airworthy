import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import DatePickerModal from '@/components/date-picker-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';
import { WorkOrderStatus } from '@/store/types';
import { formatDate, todayISO } from '@/utils/dates';

const STATUS_OPTIONS: WorkOrderStatus[] = ['open', 'in-progress', 'complete'];
const STATUS_LABELS: Record<WorkOrderStatus, string> = { open: 'Open', 'in-progress': 'In Progress', complete: 'Complete' };

export default function NewWorkOrderScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);
  const { addWorkOrder } = useStore();

  const [form, setForm] = useState({
    tail: '',
    description: '',
    mechanic: '',
    date: todayISO(),
    status: 'open' as WorkOrderStatus,
    notes: '',
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const canSave = form.tail.trim() && form.description.trim() && form.date.trim();

  const handleSave = () => {
    if (!canSave) return;
    addWorkOrder(form);
    router.back();
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field label="Description" colors={colors}>
          <TextInput style={s.input} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="e.g. 100-Hour Inspection" placeholderTextColor={colors.subtext} />
        </Field>
        <Field label="Tail Number" colors={colors}>
          <TextInput style={s.input} value={form.tail} onChangeText={(v) => setForm({ ...form, tail: v.toUpperCase() })} placeholder="e.g. N182TW" placeholderTextColor={colors.subtext} autoCapitalize="characters" />
        </Field>
        <Field label="Mechanic" colors={colors}>
          <TextInput style={s.input} value={form.mechanic} onChangeText={(v) => setForm({ ...form, mechanic: v })} placeholder="e.g. J. Martinez" placeholderTextColor={colors.subtext} />
        </Field>

        <Field label="Date" colors={colors}>
          <View style={s.dateRow}>
            <TextInput
              style={[s.input, s.dateInput]}
              value={form.date}
              onChangeText={(v) => setForm({ ...form, date: v })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
            />
            <TouchableOpacity style={s.calendarBtn} onPress={() => setShowCalendar(true)}>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {form.date.length === 10 && (
            <Text style={s.datePreview}>{formatDate(form.date)}</Text>
          )}
        </Field>

        <Field label="Status" colors={colors}>
          <View style={s.optionRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={[s.optionChip, form.status === opt && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setForm({ ...form, status: opt })}>
                <Text style={[s.optionChipText, form.status === opt && { color: '#fff' }]}>{STATUS_LABELS[opt]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <Field label="Notes" colors={colors}>
          <TextInput style={[s.input, s.textarea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline numberOfLines={4} placeholder="Optional notes…" placeholderTextColor={colors.subtext} />
        </Field>

        <View style={s.buttonRow}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.saveBtn, !canSave && s.saveBtnDisabled]} onPress={handleSave} disabled={!canSave}>
            <Text style={s.saveBtnText}>Create</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DatePickerModal
        visible={showCalendar}
        value={form.date}
        onConfirm={(iso) => { setForm({ ...form, date: iso }); setShowCalendar(false); }}
        onCancel={() => setShowCalendar(false)}
      />
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.subtext, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
    textarea: { height: 100, textAlignVertical: 'top' },
    dateRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    dateInput: { flex: 1 },
    datePreview: { marginTop: 6, fontSize: 13, color: colors.primary, fontWeight: '500' },
    calendarBtn: { backgroundColor: colors.primaryLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    optionChipText: { fontSize: 13, fontWeight: '500', color: colors.subtext },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    cancelBtnText: { color: colors.subtext, fontWeight: '600', fontSize: 16 },
    saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  });
