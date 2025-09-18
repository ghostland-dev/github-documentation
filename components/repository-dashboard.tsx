"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  GitFork,
  FileText,
  Package,
  Settings,
  AlertCircle,
  CheckCircle,
  Search,
  TrendingUp,
  Clock,
  Code,
  ExternalLink,
} from "lucide-react"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  has_readme: boolean
  has_dockerfile: boolean
  has_ci: boolean
  completion_score?: number
  analysis?: any
  html_url?: string
  default_branch?: string
  size?: number
  open_issues_count?: number
}

interface RepositoryDashboardProps {
  repositories: Repository[]
  onSelectRepository: (repo: Repository) => void
}

export function RepositoryDashboard({ repositories, onSelectRepository }: RepositoryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")
  const [viewMode, setViewMode] = useState("grid")

  const filteredAndSortedRepos = repositories
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLanguage = languageFilter === "all" || repo.language === languageFilter
      return matchesSearch && matchesLanguage
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "stars":
          return b.stargazers_count - a.stargazers_count
        case "completion":
          return getCompletionScore(b) - getCompletionScore(a)
        case "updated":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      TypeScript: "bg-blue-500",
      JavaScript: "bg-yellow-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      Go: "bg-cyan-500",
      React: "bg-cyan-400",
      Vue: "bg-green-400",
      PHP: "bg-purple-500",
      Ruby: "bg-red-400",
      "C#": "bg-purple-600",
      "C++": "bg-blue-600",
      Rust: "bg-orange-600",
      Swift: "bg-orange-500",
      Kotlin: "bg-purple-400",
      Dart: "bg-blue-400",
      HTML: "bg-orange-400",
      CSS: "bg-blue-300",
      Shell: "bg-gray-600",
    }
    return colors[language] || "bg-gray-500"
  }

  const getCompletionScore = (repo: Repository) => {
    if (repo.completion_score !== undefined) {
      return repo.completion_score
    }

    let score = 0
    if (repo.has_readme) score += 33
    if (repo.has_dockerfile) score += 33
    if (repo.has_ci) score += 34
    return score
  }

  const getCompletionColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const uniqueLanguages = Array.from(new Set(repositories.map((r) => r.language).filter(Boolean)))

  const stats = {
    total: repositories.length,
    fullyDocumented: repositories.filter((r) => getCompletionScore(r) >= 80).length,
    needsAttention: repositories.filter((r) => getCompletionScore(r) < 50).length,
    averageStars: Math.round(repositories.reduce((sum, r) => sum + r.stargazers_count, 0) / repositories.length),
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Portfolio GitHub</h2>
            <p className="text-slate-600 dark:text-slate-400">Gérez et documentez vos repositories automatiquement</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? "Vue Liste" : "Vue Grille"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Repositories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.fullyDocumented}</p>
                  <p className="text-xs text-muted-foreground">Documentés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.needsAttention}</p>
                  <p className="text-xs text-muted-foreground">À améliorer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageStars}</p>
                  <p className="text-xs text-muted-foreground">Stars moy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Langage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les langages</SelectItem>
              {uniqueLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getLanguageColor(lang)}`} />
                    {lang}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Dernière mise à jour</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="stars">Popularité</SelectItem>
              <SelectItem value="completion">Completion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repository Grid/List */}
      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
        {filteredAndSortedRepos.map((repo) => {
          const completionScore = getCompletionScore(repo)
          return (
            <Card
              key={repo.id}
              className={`border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 hover:shadow-xl transition-all duration-200 ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {repo.name}
                      </CardTitle>
                      {repo.html_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-sm">{repo.description || "Aucune description"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`} />
                    <span className="text-xs text-muted-foreground">{repo.language}</span>
                  </div>
                </div>

                {/* Enhanced Metadata */}
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forks_count}
                  </div>
                  {repo.open_issues_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {repo.open_issues_count}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(repo.updated_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </CardHeader>

              <CardContent className={viewMode === "list" ? "flex items-center gap-4" : ""}>
                <div className={`space-y-4 ${viewMode === "list" ? "flex items-center gap-4 space-y-0" : ""}`}>
                  {/* Completion Progress */}
                  <div className={`space-y-2 ${viewMode === "list" ? "min-w-32" : ""}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Completion</span>
                      <span className={`font-semibold ${getCompletionColor(completionScore)}`}>{completionScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          completionScore >= 80
                            ? "bg-green-500"
                            : completionScore >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${completionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={repo.has_readme ? "default" : "secondary"} className="text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      README
                      {repo.has_readme ? (
                        <CheckCircle className="ml-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                    <Badge variant={repo.has_dockerfile ? "default" : "secondary"} className="text-xs">
                      <Package className="mr-1 h-3 w-3" />
                      Docker
                      {repo.has_dockerfile ? (
                        <CheckCircle className="ml-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                    <Badge variant={repo.has_ci ? "default" : "secondary"} className="text-xs">
                      <Settings className="mr-1 h-3 w-3" />
                      CI/CD
                      {repo.has_ci ? (
                        <CheckCircle className="ml-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => onSelectRepository(repo)}
                    className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${
                      viewMode === "list" ? "min-w-48" : "w-full"
                    }`}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Documenter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedRepos.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun repository trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
        </div>
      )}
    </div>
  )
}
