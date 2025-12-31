import { apiGet } from '../../lib/api';

type Summary = {
  totals: { totalInstances: number; completed: number };
  slaBreaches: number;
  avgCycleTimeByWorkflow: { workflowId: string; avgSeconds: number }[];
};

type Bottleneck = {
  stepId: string;
  name: string;
  avgSeconds: number;
  instances: number;
  recommendation: string;
};

type Sla = { rate: number; total: number };

export default async function AnalyticsPage() {
  const [summary, bottlenecks, sla] = await Promise.all([
    apiGet<Summary>('/analytics/summary').catch(() => ({
      totals: { totalInstances: 0, completed: 0 },
      slaBreaches: 0,
      avgCycleTimeByWorkflow: [],
    })),
    apiGet<Bottleneck[]>('/analytics/bottlenecks').catch(() => []),
    apiGet<Sla>('/analytics/sla-breach-rate').catch(() => ({ rate: 0, total: 0 })),
  ]);

  return (
    <div className="grid">
      <section className="hero">
        <h2>Optimization pulse</h2>
        <p>
          See where time accumulates, how often SLAs breach, and which steps to parallelize. Keep approvals moving with
          proactive alerts.
        </p>
        <div className="cta-row">
          <span className="badge">Cycle time insights</span>
          <span className="badge">Breach risk {Math.round(sla.rate * 100)}%</span>
          <a className="button secondary" href="/workflows">
            Tune rules
          </a>
        </div>
      </section>
      <section className="card">
        <h2>Throughput</h2>
        <p className="muted">Cycle time and completion rates per workflow.</p>
        <div className="grid">
          <Stat label="Total instances" value={summary.totals.totalInstances} />
          <Stat label="Completed" value={summary.totals.completed} />
          <Stat label="Open SLA breaches" value={summary.slaBreaches} />
          <Stat label="Breach rate" value={`${Math.round(sla.rate * 100)}% (${sla.total} tasks)`} />
        </div>
        <h4>Avg cycle time (seconds)</h4>
        {summary.avgCycleTimeByWorkflow.length === 0 && <div className="muted">No completed instances yet.</div>}
        <div className="grid">
          {summary.avgCycleTimeByWorkflow.map((row) => (
            <div key={row.workflowId} className="metric">
              <div className="muted">{row.workflowId}</div>
              <div className="value">{Math.round(row.avgSeconds)}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Bottlenecks</h2>
        <p className="muted">Slowest steps with prescriptive recommendations.</p>
        {bottlenecks.length === 0 && <div className="muted">No data yet.</div>}
        {bottlenecks.map((b) => (
          <article key={b.stepId} className="bottleneck">
            <div>
              <div className="muted">Step {b.stepId}</div>
              <h4>{b.name}</h4>
              <div className="muted">Avg queue {Math.round(b.avgSeconds)}s · {b.instances} runs</div>
            </div>
            <div className="recommendation">
              <div className="pill">Recommendation</div>
              <p>{b.recommendation}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric">
      <div className="muted">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
