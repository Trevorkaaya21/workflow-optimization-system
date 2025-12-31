import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Workflow Optimization',
  description: 'Business workflow automation and analytics',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="page">
        <div className="container">
          <header className="header">
            <div>
              <h1 className="title">Workflow Optimization</h1>
              <p className="subtitle">Build, automate, and optimize approvals and tasks.</p>
            </div>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/workflows">Workflows</a>
              <a href="/analytics">Analytics</a>
              <a href="/audit">Audit</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
