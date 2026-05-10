'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Landmark, FileText, Loader2, LayoutDashboard, 
  List, ArrowUpRight, AlertCircle, ShoppingBag, PieChart as PieChartIcon, 
  ChevronRight, ArrowLeft, Bot, Check, Plane, Utensils, Moon, Search
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '@/lib/supabase';

// --- Initial Mock Data ---
let currentData = {
    user: { name: "Rohan Mehta", totalAccounts: 3 },
    summary: {
        totalSpend: 24300,
        lastMonthSpend: 22100,
        percentChange: 9.95,
        isIncrease: true
    },
    categories: [
        { name: 'Food & Dining', value: 6200, color: '#e11d48' },
        { name: 'Shopping', value: 4100, color: '#9333ea' },
        { name: 'Groceries', value: 3100, color: '#059669' },
        { name: 'Transport', value: 2800, color: '#2563eb' },
        { name: 'Subscriptions', value: 1840, color: '#d97706' },
        { name: 'Other', value: 6260, color: '#4b5563' }
    ],
    monthlyTrend: [
        { month: 'Oct 25', spend: 18200 },
        { month: 'Nov 25', spend: 21400 },
        { month: 'Dec 25', spend: 26800 },
        { month: 'Jan 26', spend: 19600 },
        { month: 'Feb 26', spend: 17900 },
        { month: 'Mar 26', spend: 22100 },
        { month: 'Apr 26', spend: 24300 }
    ],
    recentTransactions: [
        { id: 1, date: 'Apr 28', merchant: 'Swiggy', amount: 340, category: 'Food & Dining', account: 'HDFC Credit Card' },
        { id: 2, date: 'Apr 27', merchant: 'IndiGo', amount: 6200, category: 'Travel', account: 'SBI Savings' },
        { id: 3, date: 'Apr 26', merchant: 'Salary', amount: 120000, category: 'Income', account: 'SBI Savings', isIncome: true },
        { id: 4, date: 'Apr 25', merchant: 'Amazon', amount: 1899, category: 'Shopping', account: 'HDFC Credit Card' },
        { id: 5, date: 'Apr 22', merchant: 'Zomato', amount: 480, category: 'Food & Dining', account: 'Paytm Wallet' },
        { id: 6, date: 'Apr 20', merchant: 'Netflix', amount: 649, category: 'Subscriptions', account: 'HDFC Credit Card' }
    ],
    insights: [
        { id: 1, type: 'warning', icon: AlertCircle, text: '4 subscriptions detected → ₹1,840/mo' },
        { id: 2, type: 'accent', icon: ShoppingBag, text: 'Top merchant: Swiggy — ₹3,100 this month' },
        { id: 3, type: 'success', icon: PieChartIcon, text: '62% variable spend — you have flexibility' }
    ],
    story: {
        month: "April 2026",
        text: [
            "April was your most expensive month in six months — but mostly for a reason worth celebrating. You spent ₹24,300 in total, ₹2,200 more than March.",
            "The big driver? A Goa trip that cost ₹6,200 across one weekend (IndiGo flight + hotel). Outside of travel, your spending was actually pretty stable.",
            "Your Swiggy habit held steady at ₹3,100 — about ₹100 a day across the month. That's been consistent for the last 4 months.",
            "One thing to notice: you have 4 active subscriptions totalling ₹1,840/month. Hotstar + Headspace together cost ₹450/month and haven't seen any activity in 60 days."
        ],
        highlights: [
            { icon: Plane, label: 'Travel spike', value: '₹6,200 in one weekend' },
            { icon: Utensils, label: 'Consistent Swiggy', value: '₹3,100/month for 4 months' },
            { icon: Moon, label: 'Unused subs', value: '₹450/month on Hotstar + Headspace' }
        ]
    }
};

// --- Screen Components ---

const LandingScreen = ({ onStart }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full">
            <div className="flex justify-center mb-8">
                <div className="bg-primary p-4 rounded-2xl shadow-sm">
                    <BarChart2 size={32} className="text-white" />
                </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight text-center text-primary">KharchaBook</h1>
            <p className="text-xl text-textMuted mb-10 font-light text-center">
                Clear, intelligent financial insights.
            </p>
            
            <button 
                onClick={() => onStart('onboarding')}
                className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
            >
                Get Started
            </button>
        </div>
    </div>
);

const OnboardingScreen = ({ onNext, onFileUpload }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileUpload(file);
            onNext('processing');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            <div className="max-w-2xl w-full">
                <h2 className="text-3xl font-bold mb-2 text-center text-primary">Connect Data Source</h2>
                <p className="text-textMuted mb-10 text-center">Securely connect your accounts or upload a statement to begin.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="clean-panel p-8 rounded-2xl hover:border-accent transition-colors cursor-pointer" onClick={() => onNext('processing')}>
                        <div className="flex items-center gap-3 mb-6">
                            <Landmark size={24} className="text-primary" />
                            <h3 className="text-lg font-semibold text-primary">Bank Connection</h3>
                        </div>
                        <p className="text-textMuted text-sm mb-6 leading-relaxed">Securely link via Account Aggregator. Supports 50+ major Indian banks.</p>
                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-primary font-medium py-2.5 rounded-lg transition-colors">
                            Connect Bank (Mock)
                        </button>
                    </div>

                    <label className="clean-panel p-8 rounded-2xl border-dashed border-2 hover:border-accent transition-colors flex flex-col justify-center cursor-pointer">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText size={24} className="text-primary" />
                            <h3 className="text-lg font-semibold text-primary">Upload Statement</h3>
                        </div>
                        <p className="text-textMuted text-sm mb-6 leading-relaxed">Upload a standard CSV bank statement for instant analysis.</p>
                        <div className="w-full bg-gray-100 hover:bg-gray-200 text-primary font-medium py-2.5 rounded-lg transition-colors text-center inline-block">
                            Browse Files
                        </div>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
        </div>
    );
};

const ProcessingScreen = ({ onComplete, uploadedFile }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [error, setError] = useState(null);
    
    const steps = [
        "Reading statement...",
        "Normalizing transactions...",
        "Categorizing expenses via AI...",
        "Generating financial narrative..."
    ];

    useEffect(() => {
        const processData = async () => {
            try {
                // Fake progress bar loop
                let currentProgress = 0;
                const timer = setInterval(() => {
                    if (currentProgress < 90) currentProgress += 5;
                    setProgress(currentProgress);
                    setStep(Math.floor((currentProgress / 100) * steps.length));
                }, 400);

                let transactions = currentData.recentTransactions;

                if (uploadedFile) {
                    setStep(0);
                    const formData = new FormData();
                    formData.append('file', uploadedFile);
                    
                    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                    const uploadData = await uploadRes.json();
                    if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');
                    
                    transactions = uploadData.transactions;
                    setStep(1);
                }

                setStep(2);
                const insightsRes = await fetch('/api/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactions })
                });
                
                const insightsData = await insightsRes.json();
                if (!insightsData.success) throw new Error(insightsData.error || 'Insights failed');

                clearInterval(timer);
                setProgress(100);
                setStep(3);

                // Re-map LLM output string icons to actual Lucide component references
                const iconMap = { Plane, Utensils, Moon, AlertCircle, ShoppingBag };
                const parsedHighlights = insightsData.insights.story.highlights.map(h => ({
                    ...h,
                    icon: iconMap[h.icon] || AlertCircle
                }));

                const finalData = {
                    ...currentData,
                    recentTransactions: transactions,
                    categories: insightsData.insights.categories,
                    story: {
                        ...insightsData.insights.story,
                        highlights: parsedHighlights
                    }
                };

                setTimeout(() => onComplete(finalData), 500);

            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        processData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            <div className="w-full max-w-sm">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-semibold text-primary">Analyzing Data</h2>
                    <span className="text-sm font-medium text-textMuted">{Math.round(progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                    <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ease-linear ${error ? 'bg-danger' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <div className={`text-sm flex items-center gap-2 ${error ? 'text-danger' : 'text-textMuted'}`}>
                    {error ? (
                        <><AlertCircle size={14} /> Error: {error}</>
                    ) : (
                        <><Loader2 size={14} className="animate-spin" /> {steps[Math.min(step, steps.length - 1)]}</>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardLayout = ({ currentView, setView, data }) => {
    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'story', label: 'Financial Story', icon: FileText },
        { id: 'transactions', label: 'Transactions', icon: List },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-textMain">
            <aside className="w-64 bg-white border-r border-panelBorder flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <BarChart2 size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-primary">KharchaBook</span>
                </div>
                
                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map(item => {
                        const NavIcon = item.icon;
                        return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${
                                currentView === item.id 
                                ? 'bg-gray-100 text-primary' 
                                : 'text-textMuted hover:bg-gray-50 hover:text-textMain'
                            }`}
                        >
                            <NavIcon size={18} />
                            {item.label}
                        </button>
                    )})}
                </nav>
                
                <div className="p-6 border-t border-panelBorder bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white">
                            RM
                        </div>
                        <div>
                            <div className="font-medium text-sm text-primary">Rohan Mehta</div>
                            <div className="text-xs text-textMuted">Active Session</div>
                        </div>
                    </div>
                    <button 
                        onClick={async () => { await supabase.auth.signOut(); }}
                        className="w-full text-left text-sm font-medium text-danger hover:text-red-700 transition-colors mt-2"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-5xl mx-auto pb-12">
                    {currentView === 'dashboard' && <OverviewView setView={setView} data={data} />}
                    {currentView === 'story' && <StoryView setView={setView} data={data} />}
                    {currentView === 'transactions' && <TransactionsView data={data} />}
                </div>
            </main>
        </div>
    );
};

const OverviewView = ({ setView }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-1 text-primary">April 2026 Summary</h2>
                    <p className="text-textMuted text-sm">
                        Total spend: <strong className="text-primary font-semibold">₹24,300</strong>
                        <span className="inline-flex items-center gap-1 text-danger bg-red-50 px-2 py-0.5 rounded text-xs font-medium ml-2 border border-red-100">
                            <ArrowUpRight size={12} /> 9.9% vs Mar
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-panelBorder text-textMain rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-sm">
                        <option>All Accounts</option>
                        <option>HDFC Credit Card</option>
                        <option>SBI Savings</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
                {data.insights.map(insight => {
                    const colors = {
                        warning: 'text-warning bg-orange-50 border-orange-100',
                        accent: 'text-accent bg-blue-50 border-blue-100',
                        success: 'text-success bg-green-50 border-green-100'
                    };
                    const InsightIcon = insight.icon;
                    return (
                        <div key={insight.id} className="clean-panel p-4 rounded-xl flex items-start gap-3">
                            <div className={`p-1.5 rounded-md border ${colors[insight.type]}`}>
                                <InsightIcon size={16} />
                            </div>
                            <div className="text-sm font-medium text-primary mt-1">
                                {insight.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 clean-panel p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/2 h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-textMuted mb-4">Top Categories</h3>
                        <div className="space-y-3">
                            {data.categories.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        <span className="text-primary font-medium">{cat.name}</span>
                                    </div>
                                    <span className="text-textMuted font-medium">₹{cat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="clean-panel p-6 rounded-2xl flex flex-col justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-textMuted mb-2">Trend (6mo)</h3>
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyTrend}>
                                <Tooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="spend" radius={[2, 2, 0, 0]}>
                                    {data.monthlyTrend.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.monthlyTrend.length - 1 ? '#0f172a' : '#9ca3af'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-textMuted mt-3 px-1 border-t border-gray-100 pt-2">
                        <span>Oct 25</span>
                        <span>Apr 26</span>
                    </div>
                </div>
            </div>

            <div 
                onClick={() => setView('story')}
                className="clean-panel p-5 rounded-2xl flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors bg-gradient-to-r from-white to-gray-50 group"
            >
                <div className="flex gap-4 items-center">
                    <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm text-primary">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-primary">View April 2026 Narrative</h3>
                        <p className="text-textMuted text-sm">AI-generated summary of key spending drivers.</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-textMuted group-hover:text-primary transition-colors" />
            </div>
        </div>
    );
};

const StoryView = ({ setView }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 py-4">
            <button 
                onClick={() => setView('dashboard')}
                className="text-textMuted hover:text-primary flex items-center gap-2 transition-colors mb-4 text-sm font-medium"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="clean-panel p-8 md:p-10 rounded-2xl bg-white shadow-sm border border-gray-200">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs font-semibold text-textMuted uppercase tracking-wider mb-4">
                        <Bot size={14} /> AI Analysis
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-primary tracking-tight">
                        April 2026 Narrative
                    </h1>
                    <p className="text-textMuted text-sm font-medium flex items-center gap-1.5">
                        Generated May 1, 2026 <Check size={14} className="text-success" />
                    </p>
                </div>

                <div className="prose prose-slate max-w-none text-textMain text-[15px] space-y-5 leading-relaxed font-medium">
                    {data.story.text.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-5">
                        Key Highlights
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                        {MOCK_DATA.story.highlights.map((hl, idx) => {
                            const HlIcon = hl.icon;
                            return (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-primary mb-2">
                                    <HlIcon size={18} />
                                </div>
                                <div className="font-semibold text-xs uppercase tracking-wide text-textMuted mb-1">{hl.label}</div>
                                <div className="font-medium text-sm text-primary">{hl.value}</div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransactionsView = ({ data }) => {
    return (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1 text-primary">Transaction History</h2>
                    <p className="text-textMuted text-sm">Review categorized ledger entries.</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-white border border-panelBorder text-textMain rounded-lg pl-9 pr-4 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-sm w-56"
                    />
                </div>
            </div>

            <div className="clean-panel rounded-2xl flex-1 overflow-hidden flex flex-col bg-white">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-textMuted text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 font-semibold text-textMuted text-xs uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 font-semibold text-textMuted text-xs uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 font-semibold text-textMuted text-xs uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 font-semibold text-textMuted text-xs uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.recentTransactions.map((txn, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3.5 text-sm font-medium text-textMuted whitespace-nowrap">{txn.date}</td>
                                    <td className="px-6 py-3.5 font-medium text-primary">{txn.merchant}</td>
                                    <td className="px-6 py-3.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-gray-100 text-textMuted border border-gray-200">
                                            {txn.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-sm text-textMuted font-medium">{txn.account}</td>
                                    <td className={`px-6 py-3.5 font-semibold text-sm text-right ${txn.isIncome ? 'text-success' : 'text-primary'}`}>
                                        {txn.isIncome ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AuthScreen = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.session) onAuthSuccess(data.session);
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) {
                    onAuthSuccess(data.session);
                } else {
                    setError('Check your email for the confirmation link.');
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            <div className="w-full max-w-sm clean-panel p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-3 rounded-xl">
                        <BarChart2 size={24} className="text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-primary mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-center text-textMuted mb-8">
                    {isLogin ? 'Sign in to access your financial insights' : 'Sign up to start tracking your expenses'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-danger text-sm rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-textMain rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMain mb-1.5">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-textMain rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-textMuted hover:text-primary transition-colors font-medium"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [session, setSession] = useState(null);
    const [appState, setAppState] = useState('landing');
    const [dashboardView, setDashboardView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [financialData, setFinancialData] = useState(currentData);

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) setAppState('onboarding');
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN') {
                setAppState('onboarding');
            } else if (event === 'SIGNED_OUT') {
                setAppState('landing');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    // Force auth screen if they try to proceed past landing without a session
    if (appState !== 'landing' && !session) {
        return <AuthScreen onAuthSuccess={(sess) => {
            setSession(sess);
            setAppState('onboarding');
        }} />;
    }

    return (
        <div className="antialiased text-textMain selection:bg-primary/10">
            {appState === 'landing' && (
                session 
                    ? <OnboardingScreen onNext={setAppState} onFileUpload={setUploadedFile} /> 
                    : <LandingScreen onStart={() => setAppState('auth')} />
            )}
            {appState === 'auth' && (
                <AuthScreen onAuthSuccess={(sess) => {
                    setSession(sess);
                    setAppState('onboarding');
                }} />
            )}
            {appState === 'onboarding' && <OnboardingScreen onNext={setAppState} onFileUpload={setUploadedFile} />}
            {appState === 'processing' && <ProcessingScreen uploadedFile={uploadedFile} onComplete={(data) => {
                setFinancialData(data);
                setAppState('dashboard');
            }} />}
            {appState === 'dashboard' && <DashboardLayout currentView={dashboardView} setView={setDashboardView} data={financialData} />}
        </div>
    );
}
