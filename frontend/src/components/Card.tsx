import React from 'react';

export default function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow border border-slate-200 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
