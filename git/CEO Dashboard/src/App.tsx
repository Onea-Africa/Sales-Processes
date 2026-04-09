import { useState } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const data = [
    { name: 'W10', revenue: 9800, cash: 18200, subs: 79 },
    { name: 'W11', revenue: 11200, cash: 19800, subs: 81 },
    { name: 'W12', revenue: 10500, cash: 20400, subs: 83 },
    { name: 'W13', revenue: 13100, cash: 21900, subs: 85 },
    { name: 'W14', revenue: 12400, cash: 22400, subs: 87 },
];

const pieData = [
    { name: 'Connectivity', value: 28400, color: '#8CC444' },
    { name: 'Digital Agency', value: 14200, color: '#D6139F' },
    { name: 'IT & Projects', value: 5900, color: '#F4D350' },
];

function App() {
    const [selectedTab, setSelectedTab] = useState('overview');

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <div className="logo">CEO Dashboard</div>
                    <p className="subtitle">Live executive view for Onea Africa</p>
                </div>
                <div className="status-pill">Live data preview</div>
            </header>

            <section className="tabs">
                {['overview', 'revenue', 'subscriptions', 'clients'].map((tab) => (
                    <button
                        key={tab}
                        className={tab === selectedTab ? 'tab active' : 'tab'}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </section>

            <main>
                <div className="grid-3">
                    <div className="card">
                        <div className="card-title">MTD Revenue</div>
                        <div className="card-value">R 48,500</div>
                        <div className="card-meta">40% of target</div>
                    </div>
                    <div className="card">
                        <div className="card-title">Cash Balance</div>
                        <div className="card-value">R 22,400</div>
                        <div className="card-meta">1.8 months runway</div>
                    </div>
                    <div className="card">
                        <div className="card-title">Active Subscribers</div>
                        <div className="card-value">87</div>
                        <div className="card-meta">14 pending installs</div>
                    </div>
                </div>

                <section className="charts-row">
                    <div className="card chart-card">
                        <div className="card-title">Weekly Revenue Trend</div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8CC444" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#8CC444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8DC" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                <YAxis tick={{ fill: '#6B7280' }} />
                                <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#8CC444" fill="url(#colorRevenue)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card chart-card">
                        <div className="card-title">Revenue Split</div>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;
