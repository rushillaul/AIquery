import { useState } from 'react';
import { Search, Database, AlertCircle, Code2, Sparkles, Terminal } from 'lucide-react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showSchema, setShowSchema] = useState(false);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: query })
      });
      
      const data = await response.json();

      if (!response.ok) {
        setResult({
          isDangerous: response.status === 403,
          sql: data.constructed_sql || '-- Error',
          explanation: data.ai_explanation || data.error || data.message || 'An error occurred.',
          data: null
        });
      } else {
        setResult({
          isDangerous: false,
          sql: data.sql,
          explanation: data.explanation,
          data: data.results && data.results.length > 0 ? data.results : null
        });
      }
    } catch (error) {
      console.error("Error generating query:", error);
      setResult({
        isDangerous: false,
        sql: '-- Error',
        explanation: 'Failed to connect to backend server. Make sure it is running.',
        data: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container animate-slide-up" style={{ position: 'relative' }}>
      <button 
        className="action-btn" 
        onClick={() => setShowSchema(!showSchema)}
        style={{ position: 'absolute', top: '20px', right: '20px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)' }}
      >
        <Database size={16} />
        {showSchema ? 'Hide Schema' : 'View Schema'}
      </button>

      <header className="header">
        <h1>
          <Database size={40} className="text-accent-primary" />
          AI QueryGen
        </h1>
        <p>Translate plain English directly into optimized, production-ready SQL logic.</p>
      </header>

      {showSchema && (
        <section className="schema-info glass-panel animate-slide-up" style={{ marginBottom: '2rem', padding: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <Database size={20} className="text-accent-primary" /> Available Database Schema
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Table: users</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                <li><strong>id</strong> (INTEGER) - Primary Key</li>
                <li><strong>name</strong> (TEXT)</li>
                <li><strong>email</strong> (TEXT)</li>
                <li><strong>role</strong> (TEXT)</li>
                <li><strong>salary</strong> (INTEGER)</li>
              </ul>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>Table: orders</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                <li><strong>id</strong> (INTEGER) - Primary Key</li>
                <li><strong>user_id</strong> (INTEGER) - Foreign Key</li>
                <li><strong>amount</strong> (REAL)</li>
                <li><strong>status</strong> (TEXT)</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="search-section glass-panel">
        <div className="input-wrapper">
          <Sparkles className="input-icon" size={24} />
          <textarea
            className="query-input"
            placeholder="E.g., Show me the number of employees in each department sorted by the highest..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="action-btn" 
            onClick={handleGenerate}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Terminal size={18} />
                Generate SQL
              </>
            )}
          </button>
        </div>
      </section>

      {result && result.isDangerous && (
        <section className="danger-banner animate-slide-up">
          <AlertCircle className="danger-icon" size={24} />
          <div>
            <strong>Safety Violation Detected</strong>
            <p style={{ margin: 0, marginTop: '4px', fontSize: '0.9rem' }}>
              We've blocked this query because it potentially contains destructive operations (e.g. DROP, DELETE) without proper safeguards.
            </p>
          </div>
        </section>
      )}

      {result && (
        <div className="results-grid animate-slide-up">
          <section className="result-card glass-panel">
            <div className="card-header">
              <Code2 className="card-icon" size={20} />
              <h2>Generated SQL</h2>
            </div>
            <pre className="sql-code font-mono">
              {result.sql}
            </pre>
          </section>

          <section className="result-card glass-panel">
            <div className="card-header">
              <Search className="card-icon" size={20} />
              <h2>Query Explanation</h2>
            </div>
            <p className="explanation-text">
              {result.explanation}
            </p>
          </section>
        </div>
      )}

      {result && result.data && (
        <section className="data-table-container glass-panel animate-slide-up">
          <div className="card-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '16px' }}>
            <Database className="card-icon" size={20} />
            <h2>Execution Results (Preview)</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {Object.keys(result.data[0]).map((key) => (
                    <th key={key}>{key.replace('_', ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
