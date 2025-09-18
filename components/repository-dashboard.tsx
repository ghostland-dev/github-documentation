"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Calendar, FileText, Package, Settings, AlertCircle, CheckCircle } from "lucide-react"

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
}

interface RepositoryDashboardProps {
  repositories: Repository[]
  onSelectRepository: (repo: Repository) => void
}

export function RepositoryDashboard({ repositories, onSelectRepository }: RepositoryDashboardProps) {
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
    }
    return colors[language] || "bg-gray-500"
  }

  const getCompletionScore = (repo: Repository) => {
    if (repo.completion_score !== undefined) {
      return repo.completion_score
    }

    // Fallback to old calculation
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Vos Repositories</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Sélectionnez un repository pour générer sa documentation automatiquement
        </p>
        <div className="mt-4 flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>{repositories.length} repositories trouvés</span>
          <span>•</span>
          <span>{repositories.filter((r) => getCompletionScore(r) >= 80).length} complètement documentés</span>
          <span>•</span>
          <span>{repositories.filter((r) => getCompletionScore(r) < 50).length} nécessitent une attention</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repo) => {
          const completionScore = getCompletionScore(repo)
          return (
            <Card
              key={repo.id}
              className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 hover:shadow-xl transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">{repo.name}</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      {repo.description || "Aucune description"}
                    </CardDescription>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`} />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forks_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(repo.updated_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Status des fichiers */}
                  <div className="space-y-2">
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

                  {/* Badges de status */}
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Documenter ce projet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
