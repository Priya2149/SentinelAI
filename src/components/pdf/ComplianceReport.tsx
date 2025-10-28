"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type DailyMetric = {
  date: string;
  calls: number;
  avgLatencyMs: number;
  costUsd: number;
  errors: number;
  errorRate: number;
};

export default function ComplianceReport({
  data,
}: {
  data: {
    totalCalls: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
    hallucinationRate: number; // 0–1
    failures: number;
    successCount?: number;
    flaggedCount?: number;
    toxicityRate?: number;     // 0–1
    euAiActRisk: string;
    daily?: DailyMetric[];
    window?: { from?: string; to?: string } | undefined;
  };
}) {
  const success = data.successCount ?? Math.max(data.totalCalls - data.failures - (data.flaggedCount ?? 0), 0);
  const successRate = data.totalCalls ? (success / data.totalCalls) * 100 : 0;
  const toxicityRate = data.toxicityRate ?? 0;
  const costPerCall = data.totalCalls ? data.estimatedCostUsd / data.totalCalls : 0;

  const daily = (data.daily ?? []).slice(-20);
  const windowRange =
    data.window?.from || data.window?.to
      ? `${data.window?.from ?? "—"} → ${data.window?.to ?? "—"}`
      : "Last 30 days";

  const ts = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 11, color: "#111827", backgroundColor: "#ffffff" },

    /* Cover */
    cover: { padding: 56, justifyContent: "center" },
    title: { fontSize: 28, fontWeight: 700, marginBottom: 6 },
    subtitle: { fontSize: 12, color: "#374151" },
    meta: { marginTop: 16, fontSize: 11, color: "#374151" },
    hr: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 20 },

    /* Body */
    body: { padding: 48 },
    h2: {
      fontSize: 14, fontWeight: 700, color: "#111827",
      marginTop: 16, marginBottom: 10, borderBottom: "1px solid #e5e7eb", paddingBottom: 6,
    },
    p: { fontSize: 11, lineHeight: 1.35, color: "#1f2937" },

    /* KPI grid */
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8, marginBottom: 10 },
    card: { border: "1px solid #e5e7eb", borderRadius: 6, padding: 12, flexGrow: 1, flexBasis: "45%" },
    kVal: { fontSize: 18, fontWeight: 700 },
    kLbl: { fontSize: 9, color: "#6b7280", marginTop: 2 },

    /* Status row */
    row: { flexDirection: "row", gap: 12 },
    box: { flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: 12 },

    /* Table */
    table: { marginTop: 8, border: "1px solid #e5e7eb", borderRadius: 6 },
    tr: { flexDirection: "row" },
    th: {
      flex: 1, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#f3f4f6",
      fontSize: 9, fontWeight: 700, color: "#111827", borderRight: "1px solid #e5e7eb",
    },
    td: {
      flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 10, color: "#111827",
      borderTop: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb",
    },
    tdR: { textAlign: "right" },

    /* Footer */
    footer: {
      position: "absolute", left: 48, right: 48, bottom: 24,
      borderTop: "1px solid #e5e7eb", paddingTop: 8, color: "#6b7280", fontSize: 10,
      flexDirection: "row", justifyContent: "space-between",
    },
  });

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.title}>AI Governance Report</Text>
          <Text style={styles.subtitle}>Performance, Safety, and Cost Summary</Text>
          <View style={styles.hr} />
          <Text style={styles.meta}>Generated: {ts}</Text>
          <Text style={styles.meta}>Reporting window: {windowRange}</Text>
          <Text style={styles.meta}>EU AI Act Risk: {data.euAiActRisk}</Text>
        </View>
        <View fixed style={styles.footer}>
          <Text>Confidential</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* SUMMARY & KPIs */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.body}>
          <Text style={styles.h2}>Executive Summary</Text>
          <Text style={styles.p}>
            This report summarizes LLM usage and guardrail indicators for the selected window. It
            highlights call volume, latency, cost efficiency, and safety checks suitable for audit
            attachments or stakeholder updates.
          </Text>

          <Text style={styles.h2}>Key Performance Indicators</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.kVal}>{data.totalCalls.toLocaleString()}</Text>
              <Text style={styles.kLbl}>Total Calls</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kVal}>{data.avgLatencyMs} ms</Text>
              <Text style={styles.kLbl}>Average Latency</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kVal}>${costPerCall.toFixed(5)}</Text>
              <Text style={styles.kLbl}>Avg Cost / Call</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kVal}>{(data.hallucinationRate * 100).toFixed(1)}%</Text>
              <Text style={styles.kLbl}>Hallucination Rate</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 6 }]}>
            <View style={styles.box}>
              <Text style={styles.kVal}>{(toxicityRate * 100).toFixed(1)}%</Text>
              <Text style={styles.kLbl}>Toxicity Rate</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.kVal}>{successRate.toFixed(1)}%</Text>
              <Text style={styles.kLbl}>Success Rate</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.kVal}>${data.estimatedCostUsd.toFixed(4)}</Text>
              <Text style={styles.kLbl}>Total Cost (window)</Text>
            </View>
          </View>

          <Text style={styles.h2}>Status Breakdown</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.kVal}>{(data.successCount ?? success).toLocaleString()}</Text>
              <Text style={styles.kLbl}>Success</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kVal}>{data.failures.toLocaleString()}</Text>
              <Text style={styles.kLbl}>Failures</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.kVal}>{(data.flaggedCount ?? 0).toLocaleString()}</Text>
              <Text style={styles.kLbl}>Flagged</Text>
            </View>
          </View>
        </View>
        <View fixed style={styles.footer}>
          <Text>Confidential</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* APPENDIX */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.body}>
          <Text style={styles.h2}>Appendix — Daily Breakdown</Text>
          {daily.length ? (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Text style={[styles.th, { flex: 1.2 }]}>Date</Text>
                <Text style={[styles.th, { textAlign: "right" }]}>Calls</Text>
                <Text style={[styles.th, { textAlign: "right" }]}>Errors</Text>
                <Text style={[styles.th, { textAlign: "right" }]}>Err %</Text>
                <Text style={[styles.th, { textAlign: "right" }]}>Avg Lat (ms)</Text>
                <Text style={[styles.th, { textAlign: "right" }]}>Cost ($)</Text>
              </View>
              {daily.slice().reverse().map((r, i) => (
                <View key={i} style={styles.tr} wrap={false}>
                  <Text style={[styles.td, { flex: 1.2 }]}>
                    {new Date(r.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", weekday: "short",
                    })}
                  </Text>
                  <Text style={[styles.td, styles.tdR]}>{r.calls.toLocaleString()}</Text>
                  <Text style={[styles.td, styles.tdR]}>{r.errors.toLocaleString()}</Text>
                  <Text style={[styles.td, styles.tdR]}>{(r.errorRate * 100).toFixed(1)}%</Text>
                  <Text style={[styles.td, styles.tdR]}>{r.avgLatencyMs}</Text>
                  <Text style={[styles.td, styles.tdR]}>${r.costUsd.toFixed(4)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.p}>No daily data available for this window.</Text>
          )}
        </View>
        <View fixed style={styles.footer}>
          <Text>Confidential</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
