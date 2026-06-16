import React from 'react';

export default function DashboardStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Pending */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Request Baru</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Proyek Berjalan</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.active}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Testing */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Sedang Dites QA</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.testing}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Proyek Selesai</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.completed}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
