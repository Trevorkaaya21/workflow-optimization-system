import { apiGet } from '../../lib/api';

type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  metadata: Record<string, unknown>;
  timestamp: string;
};

export default async function AuditPage() {
  const logs = await apiGet<AuditLog[]>('/audit').catch(() => []);
  return (
    <section className="card">
      <div className="header-row">
        <div>
          <h2>Audit log</h2>
          <p className="muted">Every action recorded for compliance and traceability.</p>
        </div>
        <div className="cta-row">
          <span className="chip">Immutable</span>
          <a className="button secondary" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/audit/export`}>
            Export CSV
          </a>
        </div>
      </div>
      <div className="audit">
        {logs.map((log) => (
          <div key={log.id} className="audit__row">
            <div>
              <div className="muted">{new Date(log.timestamp).toLocaleString()}</div>
              <div>{log.action}</div>
            </div>
            <div className="muted">Actor: {log.actorId}</div>
            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
          </div>
        ))}
        {logs.length === 0 && <div className="muted">No events yet.</div>}
      </div>
    </section>
  );
}
