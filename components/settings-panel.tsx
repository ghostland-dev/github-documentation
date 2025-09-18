"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Moon, Sun, Monitor, Github, Zap, Save, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  githubToken?: string
  geminiApiKey?: string
  onTokensUpdate: (tokens: { github?: string; gemini?: string }) => void
}

export function SettingsPanel({ isOpen, onClose, githubToken, geminiApiKey, onTokensUpdate }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [localGithubToken, setLocalGithubToken] = useState(githubToken || "")
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey || "")
  const [autoCommit, setAutoCommit] = useState(true)
  const [commitPrefix, setCommitPrefix] = useState("docs:")
  const [generateTests, setGenerateTests] = useState(false)

  const handleSave = () => {
    onTokensUpdate({
      github: localGithubToken,
      gemini: localGeminiKey,
    })

    // Save other settings to localStorage
    localStorage.setItem(
      "gitdocs-settings",
      JSON.stringify({
        autoCommit,
        commitPrefix,
        generateTests,
      }),
    )

    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été mises à jour.",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l shadow-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Paramètres</h2>
                <p className="text-sm text-muted-foreground">Configuration de GitDocs Pro</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Tabs defaultValue="api" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api">API & Tokens</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
              <TabsTrigger value="behavior">Comportement</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Token
                  </CardTitle>
                  <CardDescription>Token d'accès personnel pour interagir avec l'API GitHub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-token">Token GitHub</Label>
                    <Input
                      id="github-token"
                      type="password"
                      placeholder="ghp_..."
                      value={localGithubToken}
                      onChange={(e) => setLocalGithubToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Créez un token sur{" "}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub Settings
                      </a>
                    </p>
                  </div>
                  {localGithubToken && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Token configuré
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Gemini API
                  </CardTitle>
                  <CardDescription>Clé API pour la génération de contenu avec Gemini AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-key">Clé API Gemini</Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="AIzaSy..."
                      value={localGeminiKey}
                      onChange={(e) => setLocalGeminiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Obtenez votre clé sur{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  {localGeminiKey && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Clé configurée
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thème</CardTitle>
                  <CardDescription>Choisissez l'apparence de l'application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-2 h-auto p-4"
                    >
                      <Sun className="h-6 w-6" />
                      Clair
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-2 h-auto p-4"
                    >
                      <Moon className="h-6 w-6" />
                      Sombre
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-2 h-auto p-4"
                    >
                      <Monitor className="h-6 w-6" />
                      Système
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commits automatiques</CardTitle>
                  <CardDescription>Configuration des commits vers GitHub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Commit automatique</Label>
                      <p className="text-sm text-muted-foreground">Commit automatiquement après génération</p>
                    </div>
                    <Switch checked={autoCommit} onCheckedChange={setAutoCommit} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commit-prefix">Préfixe des commits</Label>
                    <Input
                      id="commit-prefix"
                      value={commitPrefix}
                      onChange={(e) => setCommitPrefix(e.target.value)}
                      placeholder="docs:"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Génération avancée</CardTitle>
                  <CardDescription>Options de génération de contenu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Générer les tests</Label>
                      <p className="text-sm text-muted-foreground">
                        Inclure des exemples de tests dans la documentation
                      </p>
                    </div>
                    <Switch checked={generateTests} onCheckedChange={setGenerateTests} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
