import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  visible: boolean;
  value: string; // ISO YYYY-MM-DD
  onConfirm: (iso: string) => void;
  onCancel: () => void;
}

function parseISO(iso: string): Date {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function DatePickerModal({ visible, value, onConfirm, onCancel }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = styles(colors);

  const initial = parseISO(value);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState(initial);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDay = (day: number) => {
    setSelected(new Date(viewYear, viewMonth, day));
  };

  const handleConfirm = () => {
    const iso = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
    onConfirm(iso);
  };

  const isSelected = (day: number) =>
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  // Build grid: blanks + days
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.sheetTitle}>Select Date</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={s.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={s.monthNav}>
            <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
              <Text style={s.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
              <Text style={s.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={s.dayLabels}>
            {DAYS.map((d) => (
              <Text key={d} style={s.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={s.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`blank-${i}`} style={s.cell} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <TouchableOpacity key={day} style={s.cell} onPress={() => handleDay(day)} activeOpacity={0.7}>
                  <View style={[s.dayCircle, sel && { backgroundColor: colors.primary }, tod && !sel && { borderWidth: 1.5, borderColor: colors.primary }]}>
                    <Text style={[s.dayText, sel && { color: '#fff' }, tod && !sel && { color: colors.primary, fontWeight: '700' }]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected date display */}
          <View style={s.selectedRow}>
            <Text style={s.selectedLabel}>Selected: </Text>
            <Text style={s.selectedValue}>
              {MONTHS[selected.getMonth()]} {selected.getDate()}, {selected.getFullYear()}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    cancelText: { fontSize: 16, color: colors.subtext },
    doneText: { fontSize: 16, fontWeight: '700', color: colors.primary },
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    navBtn: { padding: 8 },
    navArrow: { fontSize: 28, color: colors.primary, lineHeight: 30 },
    monthLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
    dayLabels: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
    dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.subtext, textTransform: 'uppercase' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    cell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 15, color: colors.text },
    selectedRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
    selectedLabel: { fontSize: 14, color: colors.subtext },
    selectedValue: { fontSize: 14, fontWeight: '600', color: colors.primary },
  });
