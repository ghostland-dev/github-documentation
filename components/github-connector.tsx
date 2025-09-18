"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Key, User, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GitHubAPI } from "@/lib/github-api"
import { RepositoryAnalyzer } from "@/lib/repository-analyzer"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GitHubConnectorProps {
  onConnect: (repositories: any[], github: GitHubAPI, analyzer: RepositoryAnalyzer) => void
}

export function GitHubConnector({ onConnect }: GitHubConnectorProps) {
  const [token, setToken] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!token || !username) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const github = new GitHubAPI(token)
      const analyzer = new RepositoryAnalyzer(github)

      // Verify token and get user info
      const user = await github.getUser()

      // Get user repositories
      const repositories = await github.getUserRepositories(username)

      // Analyze each repository
      const analyzedRepos = await Promise.all(
        repositories.slice(0, 10).map(async (repo) => {
          // Limit to 10 repos for performance
          try {
            const analysis = await analyzer.analyzeRepository(repo.full_name.split("/")[0], repo.name)
            return {
              ...repo,
              analysis,
              has_readme: analysis.hasReadme,
              has_dockerfile: analysis.hasDockerfile,
              has_ci: analysis.hasGitHubActions,
              completion_score: analysis.completionScore,
            }
          } catch (error) {
            console.error(`Error analyzing ${repo.name}:`, error)
            return {
              ...repo,
              analysis: null,
              has_readme: false,
              has_dockerfile: false,
              has_ci: false,
              completion_score: 0,
            }
          }
        }),
      )

      onConnect(analyzedRepos, github, analyzer)

      toast({
        title: "Connexion réussie !",
        description: `${repositories.length} repositories trouvés pour ${user.login}`,
      })
    } catch (error: any) {
      console.error("GitHub connection error:", error)
      setError(error.message || "Impossible de se connecter à GitHub. Vérifiez vos identifiants.")
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter à GitHub",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4">
          <Github className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">Connecter GitHub</CardTitle>
        <CardDescription>Connectez votre compte GitHub pour commencer à documenter vos projets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nom d'utilisateur GitHub
          </Label>
          <Input
            id="username"
            placeholder="votre-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Token d'accès personnel
          </Label>
          <Input
            id="token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Créez un token sur GitHub → Settings → Developer settings → Personal access tokens
            <br />
            Permissions requises: repo, user
          </p>
        </div>

        <Button
          onClick={handleConnect}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={isLoading}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </CardContent>
    </Card>
  )
}
