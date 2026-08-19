import React, { useState, useEffect } from 'react';
import type { SocketLog } from '../types';
import { subscribeLogs } from '../services/socket';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export const SocketInspector: React.FC = () => {
  const [logs, setLogs] = useState<SocketLog[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    });
    return unsubscribe;
  }, []);

  return (
    <div className={`socket-inspector-drawer ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="drawer-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="drawer-title">
          <Terminal size={16} />
          <span>SOCKET INSPECTOR ({logs.length} EVENTS)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLogs([]);
            }}
            style={{ background: 'none', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '0.2rem' }}
            title="Clear logs"
          >
            <Trash2 size={14} />
          </button>
          {isCollapsed ? <ChevronUp size={16} style={{ color: '#fff' }} /> : <ChevronDown size={16} style={{ color: '#fff' }} />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="drawer-body">
          {logs.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 0' }}>
              Listening for live WebSocket events...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-item ${log.event}`}>
                <div className="log-header">
                  <span>{log.direction === 'in' ? '⬇️ IN:' : '⬆️ OUT:'} {log.event}</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{log.timestamp}</span>
                </div>
                <div className="log-json">
                  {JSON.stringify(log.payload, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
