"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Package, Settings, Zap, Github } from "lucide-react"
import { GitHubConnector } from "@/components/github-connector"
import { RepositoryDashboard } from "@/components/repository-dashboard"
import { DocumentationGenerator } from "@/components/documentation-generator"
import { SettingsPanel } from "@/components/settings-panel"
import type { GitHubAPI } from "@/lib/github-api"
import type { RepositoryAnalyzer } from "@/lib/repository-analyzer"

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<any>(null)
  const [repositories, setRepositories] = useState<any[]>([])
  const [githubAPI, setGithubAPI] = useState<GitHubAPI | null>(null)
  const [analyzer, setAnalyzer] = useState<RepositoryAnalyzer | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [githubToken, setGithubToken] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")

  const handleTokensUpdate = (tokens: { github?: string; gemini?: string }) => {
    if (tokens.github) setGithubToken(tokens.github)
    if (tokens.gemini) setGeminiApiKey(tokens.gemini)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Github className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">GitDocs Pro</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Documentation automatique professionnelle</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Zap className="mr-1 h-3 w-3" />
                Gemini AI
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
                Transformez vos projets GitHub en
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {" "}
                  documentation professionnelle
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 text-pretty">
                Génération automatique de README.md, Dockerfile, CI/CD et plus encore avec l'intelligence artificielle
                Gemini
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
                <CardHeader>
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">README Intelligent</CardTitle>
                  <CardDescription>Génération automatique de documentation complète et professionnelle</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
                <CardHeader>
                  <Package className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle className="text-lg">Docker & Compose</CardTitle>
                  <CardDescription>Création automatique de Dockerfile et docker-compose optimisés</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
                <CardHeader>
                  <Settings className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">CI/CD Pipeline</CardTitle>
                  <CardDescription>Configuration automatique des workflows GitHub Actions</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* GitHub Connection */}
            <GitHubConnector
              onConnect={(repos, github, repoAnalyzer) => {
                setRepositories(repos)
                setGithubAPI(github)
                setAnalyzer(repoAnalyzer)
                setIsConnected(true)
              }}
            />
          </div>
        ) : selectedRepo ? (
          <DocumentationGenerator
            repository={selectedRepo}
            githubAPI={githubAPI!}
            analyzer={analyzer!}
            onBack={() => setSelectedRepo(null)}
          />
        ) : (
          <RepositoryDashboard repositories={repositories} onSelectRepository={setSelectedRepo} />
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        githubToken={githubToken}
        geminiApiKey={geminiApiKey}
        onTokensUpdate={handleTokensUpdate}
      />
    </div>
  )
}
