'use client';

import { FormEvent, useState } from 'react';

type Step = {
  stepOrder: number;
  type: string;
  roleRequired: string;
  slaMinutes?: number;
};

export function WorkflowForm() {
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<Step[]>([
    { stepOrder: 1, type: 'Submit', roleRequired: 'manager', slaMinutes: 60 },
    { stepOrder: 2, type: 'Review', roleRequired: 'ops', slaMinutes: 240 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addStep = () => {
    setSteps((prev) => [...prev, { stepOrder: prev.length + 1, type: 'Approve', roleRequired: 'director' }]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'manager' },
        body: JSON.stringify({ name, steps }),
      });
      if (!res.ok) throw new Error('Failed to create workflow');
      setSuccess(true);
      setName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="header-row">
        <div>
          <h3>Create workflow</h3>
          <p className="muted">Start with a few steps; add rules later.</p>
        </div>
        <span className="chip">Draft</span>
      </div>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Quarterly Spend Approval" required />
      </label>
      <div className="muted">Steps</div>
      {steps.map((step, idx) => (
        <div key={idx} className="step-row">
          <input
            value={step.type}
            onChange={(e) => updateStep(idx, { ...step, type: e.target.value })}
            placeholder="Submit / Review / Approve"
          />
          <input
            value={step.roleRequired}
            onChange={(e) => updateStep(idx, { ...step, roleRequired: e.target.value })}
            placeholder="ops / finance / director"
          />
          <input
            type="number"
            value={step.slaMinutes ?? ''}
            onChange={(e) => updateStep(idx, { ...step, slaMinutes: Number(e.target.value) })}
            placeholder="SLA minutes"
          />
        </div>
      ))}
      <div className="cta-row">
        <button type="button" className="button secondary" onClick={addStep}>
          Add step
        </button>
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving...' : 'Create workflow'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Created! Refresh list to see it.</div>}
      <style jsx>{`
        form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
        }
        .step-row {
          display: grid;
          grid-template-columns: 1fr 1fr 120px;
          gap: 8px;
        }
        button {
          border: none;
          cursor: pointer;
        }
        .error {
          color: #b91c1c;
        }
        .success {
          color: #15803d;
        }
      `}</style>
    </form>
  );

  function updateStep(index: number, step: Step) {
    setSteps((prev) => prev.map((s, i) => (i === index ? step : s)));
  }
}
