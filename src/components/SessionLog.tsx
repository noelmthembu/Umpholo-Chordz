interface SessionLogProps {
  log: string[];
}

export function SessionLog({ log }: SessionLogProps) {
  return (
    <div className="panel">
      <h2>Session Log — non-repetition memory</h2>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.8 }}>
        {log.length === 0
          ? 'Nothing generated yet this session.'
          : log.map((line, i) => <div key={i}>&raquo; {line}</div>)}
      </div>
    </div>
  );
}
