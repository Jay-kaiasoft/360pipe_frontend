import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const IconMeetings = () => (
  <svg className="w-6 h-6 text-[#5b78ce]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9m14-4H5m14 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 0h-2M5 7h2m8-4v4m-6-4v4" />
  </svg>
);

const IconTarget = () => (
  <svg className="w-6 h-6 text-[#5b78ce]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <circle cx="12" cy="12" r="5" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h.01" />
  </svg>
);

const IconCoins = () => (
  <svg className="w-7 h-7 text-[#1a3875]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-3.314 0-6 1.12-6 2.5S8.686 13 12 13s6-1.12 6-2.5S15.314 8 12 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 10.5v3.8c0 1.38-2.686 2.5-6 2.5s-6-1.12-6-2.5v-3.8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 14.3v3.8c0 1.38-2.686 2.5-6 2.5s-6-1.12-6-2.5v-3.8" />
  </svg>
);

const IconCash = () => (
  <svg className="w-7 h-7 text-[#1a3875]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <circle cx="6.5" cy="9.5" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="14.5" r="0.5" fill="currentColor" />
  </svg>
);

const IconCrown = () => (
  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
    <path d="M2.5 19h19a.5.5 0 01.5.5v1.5a.5.5 0 01-.5.5h-19a.5.5 0 01-.5-.5v-1.5a.5.5 0 01.5-.5zm19.34-8.73A1.5 1.5 0 0021 9a1.5 1.5 0 00-1.2-2.73l-4 1.6-2.58-4.3a1.5 1.5 0 00-2.58 0L8.06 7.87l-4-1.6A1.5 1.5 0 003 9a1.5 1.5 0 00-.84 1.27l1.45 6.5A1 1 0 004.58 17.5h14.84a1 1 0 00.97-.73l1.45-6.5z" />
  </svg>
);

const activityData = [
  { id: 1, initials: 'JS', name: 'Jay Stevens', color: 'bg-[#5b78ce]', netNew: 5, existing: 4, onsite: 1, total: 5 },
  { id: 2, initials: 'TS', name: 'Tim Sullivan', color: 'bg-[#5B76CC]', netNew: 3, existing: 3, onsite: 3, total: 6, hasCrown: true, isHighlighted: true },
  { id: 3, initials: 'SC', name: 'Sarah Carter', color: 'bg-[#76C9C4]', netNew: 1, existing: 3, onsite: 2, total: 5 },
  { id: 4, initials: 'MN', name: 'Mike Nguyen', color: 'bg-[#98B0EB]', netNew: 3, existing: 2, onsite: 1, total: 5 },
  { id: 5, initials: 'BJ', name: 'Beth Jones', color: 'bg-[#F3C78B]', netNew: 1, existing: 1, onsite: 2, total: 4 },
];

const resultsData = [
  { id: 1, initials: 'JS', name: 'Jay Stevens', color: 'bg-[#5b78ce]', pipeline: '$150k', revenue: '$55k' },
  { id: 2, initials: 'TJ', name: 'Tim James', color: 'bg-[#5b78ce]', pipeline: '$100k', revenue: '$25k', hasCrown: true },
  { id: 3, initials: 'KM', name: 'Kate Morales', color: 'bg-[#76C9C4]', pipeline: '$120k', revenue: '$45k' },
  { id: 4, initials: 'MT', name: 'Michael Tran', color: 'bg-[#98B0EB]', pipeline: '$90k', revenue: '$35k' },
  { id: 5, initials: 'JP', name: 'James Parker', color: 'bg-[#F3C78B]', pipeline: '$60k', revenue: '$15k' },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Activity');

  return (
    <div className="min-h-screen bg-[#EEEDFC] font-sans pb-20">
      {/* Header Area */}
      <div className="relative bg-[#2b4c8a] text-white py-3 shadow-lg flex items-center justify-between px-6 md:px-10">

        {/* Logo - Left */}
        <div className="flex-1 flex items-center">
          <NavLink>
            <img src="/images/logo/360Pipe_logo_white.png" alt="360Pipe Logo" className="h-[54px] w-36" />
          </NavLink>
        </div>

        {/* Center Space - Title and Tabs */}
        <div className="flex-[2] flex flex-col items-center justify-center gap-3">
          <h1 className="text-3xl font-normal tracking-wide leading-none">Performance</h1>
          <div className="flex justify-center items-center">
            <button
              onClick={() => setActiveTab('Activity')}
              className={`px-8 py-1.5 text-[14px] font-medium transition-colors border ${activeTab === 'Activity'
                ? 'bg-[#26488d] text-white border-white/60'
                : 'bg-[#F4F6FB] text-[#7185AA] border-transparent hover:bg-gray-200'
                }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('Results')}
              className={`px-8 py-1.5 text-[14px] font-medium transition-colors border ${activeTab === 'Results'
                ? 'bg-[#26488d] text-white border-white/60'
                : 'bg-[#F4F6FB] text-[#7185AA] border-transparent hover:bg-gray-200'
                }`}
            >
              Results
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <button className="flex items-center gap-2 bg-[#1e3b7b] text-white px-4 py-1.5 border border-white/30 hover:bg-[#162d60] transition">
            Q1 <span className="text-[10px] ml-1">▼</span>
          </button>
          <button className="flex items-center gap-2 bg-[#1e3b7b] text-white px-4 py-1.5 border border-white/30 hover:bg-[#162d60] transition">
            Team
          </button>
          <div className="w-9 h-9 rounded-full border-2 border-white text-white flex items-center justify-center text-sm font-bold shadow-sm ml-2">
            JJ
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto pt-6 px-4">
        {/* Sub Navigation */}
        <div className="flex gap-8 border-b border-gray-200/80 mb-8 px-2">
          <div className="pb-3 text-[14px] font-bold text-[#143d8a] border-b-2 border-[#143d8a] cursor-pointer">Performance</div>
          <div className="pb-3 text-[14px] font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Pipeline</div>
          <div className="pb-3 text-[14px] font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Team Actions</div>
        </div>

        {/* Content Area */}
        {activeTab === 'Activity' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 pl-8">
                <div className="flex items-center gap-2 mb-3">
                  <IconMeetings />
                  <span className="text-xl text-black">Total Meetings</span>
                </div>
                <div className="text-[46px] font-bold text-[#364966] leading-none mb-4 pl-10">11</div>

                <div className="h-[2px] w-[200px] bg-[#f0f4fa] mb-4 mt-8"></div>

                <div className="flex items-center text-sm mb-1 text-[#364966]">
                  <span className="font-bold text-[15px] pl-1 text-[#173a75]">7 <span className="font-normal text-[#5a6a85] ml-1">Net New</span></span>
                  <span className="text-gray-200 mx-5 font-light">|</span>
                  <span className="text-[#5a6a85]">4 Existing</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                  <span className="text-[#3fc185] pl-1 tracking-tight">+15%</span>
                  <span className="text-gray-400 font-medium">vs last week</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 pl-8 flex flex-col justify-start pt-7 relative">
                <div className="flex items-center gap-2">
                  <IconTarget />
                  <span className="text-xl text-black">Team Target</span>
                </div>
                <div className="flex items-baseline gap-2 my-4 pl-8">
                  <span className="text-[46px] font-bold text-[#364966] leading-none tracking-tight">44</span>
                  <span className="text-[46px] font-bold text-[#364966] leading-none tracking-tight">/</span>
                  <span className="text-[46px] font-bold text-[#364966] leading-none tracking-tight">50</span>
                  <span className="text-lg text-gray-500 ml-1">Meetings</span>
                </div>
                <div className="w-[85%] h-1.5 bg-[#eef1f7] rounded-full overflow-hidden mt-2 relative mx-auto shadow-inner ml-6">
                  <div className="h-full bg-gradient-to-r from-[#81e8b2] via-[#81cbf0] to-[#b0bbf8] rounded-full w-[88%] shadow-[0_0_5px_rgba(176,187,248,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8 mb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100/60 bg-[#EFEDFD]">
                    <th className="py-4 px-8 font-medium text-black text-sm tracking-[0.15em] w-1/2">REP</th>
                    <th className="py-4 px-4 font-medium text-black text-sm tracking-[0.15em] text-center w-32 border-l border-gray-50">NET NEW</th>
                    <th className="py-4 px-4 font-medium text-black text-sm tracking-[0.15em] text-center w-32 border-l border-gray-50">EXISTING</th>
                    <th className="py-4 px-4 font-medium text-black text-sm tracking-[0.15em] text-center w-32 border-l border-gray-50">ONSITE</th>
                    <th className="py-4 px-4 font-bold text-[#1a3875] bg-[#D8DBFB] text-sm tracking-[0.15em] text-center w-32 shadow-[-4px_0_10px_-8px_rgba(0,0,0,0.1)]">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.map((row) => (
                    <tr key={row.id} className={`border-b border-gray-100/60 ${row.isHighlighted ? 'bg-[#D7D9FD]' : 'bg-white'}`}>
                      <td className="py-3 px-8 flex items-center gap-4 relative">
                        {row.hasCrown && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <IconCrown />
                          </div>
                        )}
                        <div className={`w-[34px] h-[34px] rounded-full flex flex-shrink-0 items-center justify-center text-white text-[13px] font-medium shadow-sm ${row.color}`}>
                          {row.initials}
                        </div>
                        <span className="text-black text-[15px] font-normal">{row.name}</span>
                        {row.hasCrown && <span className="text-yellow-400 ml-1 mt-1"><IconCrown /></span>}
                      </td>
                      <td className="py-3 px-4 text-center text-black font-semibold text-[17px] border-l border-gray-50">{row.netNew}</td>
                      <td className="py-3 px-4 text-center text-black font-semibold text-[17px] border-l border-gray-50">{row.existing}</td>
                      <td className="py-3 px-4 text-center text-black font-semibold text-[17px] border-l border-gray-50">{row.onsite}</td>
                      <td className={`py-3 px-4 text-center font-bold text-xl text-[#1a3875] ${row.isHighlighted ? 'bg-[#B7BEFB]' : 'bg-[#D8DBFB]'} shadow-[-4px_0_10px_-8px_rgba(0,0,0,0.1)]`}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="flex items-center gap-5 text-sm px-6 text-gray-500 py-2">
              <div className="flex items-center gap-2">
                {/* <span className="w-6 h-6 rounded-full border border-[#cbd5e1] border-b-2 flex flex-col items-center justify-center -mt-1 opacity-70">
                  <div className="w-3 h-[1px] bg-[#cbd5e1]"></div>
                  <div className="w-[1px] h-3 bg-[#cbd5e1] -mt-1.5"></div>
                </span> */}
                <span className="font-normal text-[#8696b0] text-[13px] tracking-wide">Team Total</span>
                <span className="font-bold text-[#1e293b] text-[15px] ml-1">11</span>
              </div>
              <div className="w-[1px] h-4 bg-gray-300"></div>
              <div className="text-[#8696b0]"><span className="font-bold text-[#334155] mr-1.5">7</span>Net New</div>
              <div className="w-[1px] h-4 bg-gray-300"></div>
              <div className="text-[#8696b0]"><span className="font-bold text-[#334155] mr-1.5">6</span>Virtual</div>
              <div className="w-[1px] h-4 bg-gray-300"></div>
              <div className="text-[#8696b0]"><span className="font-bold text-[#334155] mr-1.5">5</span>Onsite</div>
            </div>
          </div>
        )}

        {activeTab === 'Results' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Top Cards for Results */}
            <div className="grid grid-cols-2 gap-6 mb-8 mt-4">
              {/* Card 1 */}
              <div className="bg-white rounded-[14px] shadow-lg p-6 pl-8">
                <div className="flex items-center gap-3 text-[#2a4585] font-bold text-lg mb-6 border-b-2 pb-2">
                  <IconCoins />
                  <span className="font-semibold text-xl tracking-tight">Pipeline</span>
                </div>
                <div className="flex flex-col items-center justify-center mt-4">
                  <div className="text-[44px] tracking-tight font-extrabold text-[#112a5c] leading-none mb-3">$250k</div>
                  <div className="text-[#8191ab] text-[13px] font-medium tracking-wide">Q1 FY2026</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[14px] shadow-lg p-6 pl-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f8fbff] to-transparent rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="flex items-center gap-3 text-[#2a4585] font-bold text-lg mb-6 relative z-10 border-b-2 pb-2">
                  <IconCash />
                  <span className="font-semibold text-xl tracking-tight">Revenue</span>
                </div>
                <div className="flex flex-col items-center justify-center mt-4 relative z-10">
                  <div className="text-[44px] tracking-tight font-extrabold text-[#112a5c] leading-none mb-3">$80k</div>
                  <div className="text-[#8191ab] text-[13px] font-medium tracking-wide">Q1 FY2026</div>
                </div>
              </div>
            </div>

            {/* Table for Results */}
            <div className="bg-white rounded-[12px] shadow-lg overflow-hidden border border-gray-100/50 p-2">
              <table className="w-full text-left text-sm rounded-lg overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-[#5c7dda] text-white">
                    <th className="py-3 px-8 font-semibold text-sm tracking-[0.15em] border-r border-[#7292eb] w-1/3">REP</th>
                    <th className="py-3 px-4 font-semibold text-sm tracking-[0.15em] text-center border-r border-[#7292eb]">PIPELINE</th>
                    <th className="py-3 px-4 font-semibold text-sm tracking-[0.15em] text-center">REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.map((row, idx) => (
                    <tr key={row.id} className={idx !== resultsData.length - 1 ? "border-b border-gray-100" : ""}>
                      <td className="py-3 px-8 flex items-center gap-4 relative border-r border-gray-100">
                        <div className={`w-[36px] h-[36px] rounded-full flex flex-shrink-0 items-center justify-center text-white text-[13px] font-medium shadow-sm ${row.color}`}>
                          {row.initials}
                        </div>
                        <span className="text-[#415372] text-[16px] font-normal tracking-wide">{row.name}</span>
                        {row.hasCrown && <span className="text-yellow-400 text-sm ml-1"><IconCrown /></span>}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#1c325e] text-[19px] border-r border-gray-100">{row.pipeline}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#1c325e] text-[19px] bg-white">{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;