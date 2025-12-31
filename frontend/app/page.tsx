export default function HomePage() {
  return (
    <div className="grid">
      <section className="hero">
        <h2>Map, automate, and optimize approvals without the busywork.</h2>
        <p>Launch new workflows in minutes, keep SLAs honest, and surface bottlenecks before they stall the business.</p>
        <div className="cta-row">
          <a className="button" href="/workflows">
            Create workflow
          </a>
          <a className="button secondary" href="/analytics">
            View analytics
          </a>
          <span className="badge">Realtime audit trail</span>
          <span className="badge">SLA escalations</span>
        </div>
      </section>

      <section className="card">
        <h2>Build workflows</h2>
        <p className="muted">
          Map steps, assign roles, and publish versioned workflows with SLA timers and routing rules.
        </p>
        <ul>
          <li>Create steps with role + SLA</li>
          <li>Conditional rules (auto-approve, escalate)</li>
          <li>Audit-ready change history</li>
        </ul>
      </section>
      <section className="card">
        <h2>Optimize with analytics</h2>
        <p className="muted">Bottlenecks, SLA breach rate, and cycle times across workflows and teams.</p>
        <ul>
          <li>Bottleneck detection by step</li>
          <li>Cycle/queue time trends</li>
          <li>Recommendations to parallelize or threshold approvals</li>
        </ul>
      </section>
      <section className="card">
        <h2>Automate actions</h2>
        <p className="muted">Escalations, reminders, and notifications via queues and webhooks.</p>
        <ul>
          <li>Job queue for SLA timers</li>
          <li>Email/Slack/webhooks (add provider)</li>
          <li>Structured audit log + export</li>
        </ul>
      </section>
    </div>
  );
}
