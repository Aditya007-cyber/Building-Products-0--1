'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud, AlertCircle, ShoppingBag, TrendingUp, TrendingDown, Coffee, Loader2, Smartphone, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const ICONS: Record<string, React.ReactNode> = {
  AlertCircle: <AlertCircle className="h-6 w-6" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  TrendingDown: <TrendingDown className="h-6 w-6" />,
  Coffee: <Coffee className="h-6 w-6" />,
}

export function DashboardClient() {
  const [ingestionMethod, setIngestionMethod] = useState<'csv' | 'setu'>('csv')
  const [file, setFile] = useState<File | null>(null)
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [insights, setInsights] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const processInsights = async (transactions: any[]) => {
    setLoadingStep('Analyzing Data...')
    const insightsRes = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    })
    const insightsData = await insightsRes.json()

    if (!insightsRes.ok) throw new Error(insightsData.error || 'Failed to generate insights')

    setInsights(insightsData)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      setLoadingStep('Uploading CSV...')
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed')

      await processInsights(uploadData.transactions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleSetuFetch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    setIsLoading(true)
    setError(null)

    try {
      setLoadingStep('Connecting to Setu AA...')
      const fetchRes = await fetch('/api/setu/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const fetchData = await fetchRes.json()

      if (!fetchRes.ok) throw new Error(fetchData.error || 'Failed to fetch from Setu')

      await processInsights(fetchData.transactions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  if (insights) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Your Financial Insights</h1>
          <Button variant="outline" onClick={() => setInsights(null)}>Upload New Statement</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {insights.categories.map((cat: any) => (
            <Card key={cat.name} className="border-t-4" style={{ borderTopColor: cat.color }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{cat.total.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.categories}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {insights.categories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#fafafa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={insights.categories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total">
                      {insights.categories.map((entry: any, index: number) => (
                        <Cell key={`pie-${index}`} fill={entry.color || '#fafafa'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Financial Story</CardTitle>
              <CardDescription>AI-generated analysis of your spending habits.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {insights.story}
              </p>
            </CardContent>
          </Card>

          <div className="col-span-3 space-y-4">
            {insights.highlights.map((highlight: any, i: number) => (
              <Card key={i} className="bg-secondary/50 border-none">
                <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                  <div className="p-2 bg-background rounded-full shrink-0">
                    {ICONS[highlight.icon] || <AlertCircle className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{highlight.title}</CardTitle>
                    <CardDescription className="text-xs">{highlight.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your raw ledger data, automatically categorized.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 rounded-tr-lg">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.categorizedTransactions.slice(0, 20).map((tx: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{tx.date || 'N/A'}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={tx.description}>{tx.description}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {ingestionMethod === 'csv' ? (
              <UploadCloud className="h-6 w-6 text-primary" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>Import Transactions</CardTitle>
          <CardDescription>
            Securely process your data. Ephemeral analysis means your data is never permanently stored.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex bg-secondary rounded-lg p-1 mb-6">
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                ingestionMethod === 'csv' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setIngestionMethod('csv'); setError(null); }}
            >
              CSV Upload
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                ingestionMethod === 'setu' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setIngestionMethod('setu'); setError(null); }}
            >
              Account Aggregator
            </button>
          </div>

          {ingestionMethod === 'csv' ? (
            <form onSubmit={handleUpload} className="space-y-4 animate-in slide-in-from-left-2 fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Statement (CSV)</label>
                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={!file || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingStep}
                  </>
                ) : (
                  'Generate Insights'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetuFetch} className="space-y-4 animate-in slide-in-from-right-2 fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Simulates fetching data via Setu Account Aggregator.
                </p>
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={!phone || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingStep}
                  </>
                ) : (
                  'Connect via Setu'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
