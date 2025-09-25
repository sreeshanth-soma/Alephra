/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line } from "recharts";

type VitalsPoint = { date: string; hr?: number; spo2?: number };

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const key = '__ls_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    if (!isLocalStorageAvailable()) return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    if (!isLocalStorageAvailable()) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalsPoint[]>([]);
  const [notesByDate, setNotesByDate] = useState<Record<string, string>>({});
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    const v = safeGetItem<VitalsPoint[]>("medscan.vitals", []);
    setVitals(Array.isArray(v) ? v : []);
    const n = safeGetItem<Record<string, string>>("medscan.vitalsNotes", {});
    setNotesByDate(n || {});
  }, []);

  useEffect(() => {
    safeSetItem("medscan.vitalsNotes", notesByDate);
  }, [notesByDate]);

  const daily = useMemo(() => {
    // Group by date (YYYY-MM-DD) and compute daily averages
    const map = new Map<string, { hr: number[]; spo2: number[] }>();
    for (const p of vitals) {
      const day = (p.date || "").split("T")[0] || p.date;
      if (!map.has(day)) map.set(day, { hr: [], spo2: [] });
      const bucket = map.get(day)!;
      if (typeof p.hr === 'number') bucket.hr.push(p.hr);
      if (typeof p.spo2 === 'number') bucket.spo2.push(p.spo2);
    }
    const rows = Array.from(map.entries()).map(([day, vals]) => {
      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;
      return { day, hr: avg(vals.hr), spo2: avg(vals.spo2) };
    });
    rows.sort((a, b) => a.day.localeCompare(b.day));
    // Add trend vs previous day
    return rows.map((row, i) => {
      const prev = i > 0 ? rows[i - 1] : undefined;
      const hrTrend = typeof row.hr === 'number' && typeof prev?.hr === 'number' ? row.hr - prev.hr : undefined;
      const spo2Trend = typeof row.spo2 === 'number' && typeof prev?.spo2 === 'number' ? row.spo2 - prev.spo2 : undefined;
      return { ...row, hrTrend, spo2Trend } as { day: string; hr?: number; spo2?: number; hrTrend?: number; spo2Trend?: number };
    });
  }, [vitals]);

  const overallTrend = useMemo(() => {
    if (daily.length < 2) return 'Insufficient data';
    const last = daily[daily.length - 1];
    const prev = daily[daily.length - 2];
    const hrDelta = (last.hr ?? 0) - (prev.hr ?? 0);
    const spo2Delta = (last.spo2 ?? 0) - (prev.spo2 ?? 0);
    const score = (spo2Delta) - (hrDelta / 2); // heuristic: higher SpO2, lower HR is better
    if (score > 1) return 'Improving';
    if (score < -1) return 'Worsening';
    return 'Stable';
  }, [daily]);

  const vitalsData = useMemo(() => {
    // For charting, take most recent day and show time series if present, else fallback to static
    if (!vitals.length) {
      return [
        { time: "09:00", hr: 78, spo2: 98 },
        { time: "10:00", hr: 81, spo2: 97 },
        { time: "11:00", hr: 76, spo2: 99 },
        { time: "12:00", hr: 85, spo2: 96 },
        { time: "13:00", hr: 79, spo2: 98 },
        { time: "14:00", hr: 82, spo2: 97 },
      ];
    }
    const latestDay = (vitals[vitals.length - 1].date || "").split("T")[0] || vitals[vitals.length - 1].date;
    const sameDay = vitals.filter(v => (v.date || "").startsWith(latestDay))
      .map(v => ({ time: (v.date.includes('T') ? v.date.split('T')[1].substring(0,5) : latestDay), hr: v.hr, spo2: v.spo2 }));
    if (sameDay.length) return sameDay;
    // Fallback to daily series by date when no time-of-day values exist
    return daily.map(d => ({ time: d.day, hr: d.hr, spo2: d.spo2 }));
  }, [vitals]);

  const openNotes = (day: string) => {
    setEditDate(day);
    setEditText(notesByDate[day] || "");
  };
  const saveNotes = () => {
    if (!editDate) return;
    setNotesByDate(prev => ({ ...prev, [editDate]: editText }));
    setEditDate(null);
    setEditText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Vitals</h1>
          <Link href="/dashboard" className="text-sm text-cyan-600">← Back to dashboard</Link>
        </div>
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-black dark:text-white">Heart Rate & SpO2</div>
              <div className="text-xs">
                <span className={`px-2 py-1 rounded-full ${overallTrend === 'Improving' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : overallTrend === 'Worsening' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'}`}>{overallTrend}</span>
              </div>
            </div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="hr" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHr)" name="Heart Rate" />
                  <Line type="monotone" dataKey="spo2" stroke="#22c55e" dot={false} name="SpO2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-3 text-black dark:text-white">Day-to-day notes and trend</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-300">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Avg HR</th>
                      <th className="py-2 pr-4">Avg SpO2</th>
                      <th className="py-2 pr-4">Trend</th>
                      <th className="py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.length === 0 && (
                      <tr><td className="py-3 text-gray-500" colSpan={5}>No vitals recorded yet.</td></tr>
                    )}
                    {daily.map(row => (
                      <tr key={row.day} className="border-t border-gray-200 dark:border-gray-800">
                        <td className="py-3 pr-4 text-black dark:text-white">{row.day}</td>
                        <td className="py-3 pr-4">{typeof row.hr === 'number' ? `${row.hr} bpm` : '-'}</td>
                        <td className="py-3 pr-4">{typeof row.spo2 === 'number' ? `${row.spo2}%` : '-'}</td>
                        <td className="py-3 pr-4">
                          <span className={
                            row.hrTrend && row.spo2Trend
                              ? (row.spo2Trend > 0 && row.hrTrend < 0 ? 'text-green-600' : (row.spo2Trend < 0 && row.hrTrend > 0 ? 'text-red-600' : 'text-gray-600'))
                              : 'text-gray-600'
                          }>
                            {row.hrTrend || row.spo2Trend ? (
                              <>
                                {row.hrTrend !== undefined && (row.hrTrend > 0 ? 'HR ↑ ' : row.hrTrend < 0 ? 'HR ↓ ' : 'HR → ')}
                                {row.spo2Trend !== undefined && (row.spo2Trend > 0 ? 'SpO2 ↑' : row.spo2Trend < 0 ? 'SpO2 ↓' : 'SpO2 →')}
                              </>
                            ) : '—'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[240px]">{notesByDate[row.day] || 'No notes'}</span>
                            <button onClick={() => openNotes(row.day)} className="text-xs text-cyan-600 hover:underline">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {editDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditDate(null)}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-black dark:text-white">Notes for {editDate}</div>
                <button onClick={() => setEditDate(null)} className="text-xs text-gray-600 dark:text-gray-300 hover:underline">Close</button>
              </div>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 p-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Add notes about symptoms, exercise, sleep, etc."
              />
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setEditDate(null)} className="text-xs text-gray-600 hover:underline">Cancel</button>
                <button onClick={saveNotes} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


