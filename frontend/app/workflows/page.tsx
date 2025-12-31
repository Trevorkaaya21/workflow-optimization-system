import { apiGet } from '../../lib/api';
import { WorkflowForm } from '../../components/WorkflowForm';

type Workflow = {
  id: string;
  name: string;
  version: number;
  status: string;
  steps: { id: string; stepOrder: number; type: string; roleRequired: string; slaMinutes: number | null }[];
  rules: { id: string; condition: string; action: string; priority: number }[];
};

export default async function WorkflowsPage() {
  const workflows = await apiGet<Workflow[]>('/workflows').catch(() => []);
  const active = workflows.filter((w) => w.status === 'active').length;
  const drafts = workflows.length - active;
  return (
    <div className="grid">
      <div className="card">
        <div className="header-row">
          <div>
            <h2>Workflows</h2>
            <p className="muted">Role-based steps, SLAs, and routing rules.</p>
          </div>
          <div className="stat-row" style={{ maxWidth: 320 }}>
            <div className="stat">
              <div className="label">Active</div>
              <div className="number">{active}</div>
            </div>
            <div className="stat">
              <div className="label">Drafts</div>
              <div className="number">{drafts}</div>
            </div>
          </div>
        </div>
        {workflows.length === 0 && <div>No workflows yet. Create one below.</div>}
        {workflows.map((wf) => (
          <article key={wf.id} className="workflow">
            <div className="workflow__title">
              <div>
                <h3>{wf.name}</h3>
                <div className="muted">
                  Version {wf.version} · {wf.status}
                </div>
              </div>
              <div className="pill">Steps: {wf.steps.length}</div>
            </div>
            <div className="steps">
              {wf.steps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step) => (
                  <div key={step.id} className="step">
                    <div className="muted">#{step.stepOrder}</div>
                    <div>{step.type}</div>
                    <div className="muted">{step.roleRequired}</div>
                    {step.slaMinutes && <div className="pill">SLA {step.slaMinutes}m</div>}
                  </div>
                ))}
            </div>
            <div className="timeline">
              {wf.steps.map((step) => (
                <span key={step.id} title={step.type} />
              ))}
            </div>
            {wf.rules.length > 0 && (
              <div className="rules">
                <div className="muted">Rules</div>
                {wf.rules.map((rule) => (
                  <div key={rule.id} className="rule">
                    <span className="pill">Priority {rule.priority}</span>
                    <div>
                      If <b>{rule.condition}</b> → <b>{rule.action}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <WorkflowForm />
    </div>
  );
}
