"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, Package, Settings, Zap, Copy, CheckCircle, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GitHubAPI } from "@/lib/github-api"
import type { RepositoryAnalyzer } from "@/lib/repository-analyzer"
import { GeminiAPI } from "@/lib/gemini-api"

interface DocumentationGeneratorProps {
  repository: any
  githubAPI: GitHubAPI
  analyzer: RepositoryAnalyzer
  onBack: () => void
}

export function DocumentationGenerator({ repository, githubAPI, analyzer, onBack }: DocumentationGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedFiles, setGeneratedFiles] = useState<any>({})
  const [currentStep, setCurrentStep] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const generateDocumentation = async () => {
    if (!geminiApiKey) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez entrer votre clé API Gemini",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      const gemini = new GeminiAPI(geminiApiKey)
      const [owner, repoName] = repository.full_name.split("/")

      // Step 1: Analyze repository
      setCurrentStep("Analyse du repository...")
      setProgress(10)

      const analysis = await analyzer.analyzeRepository(owner, repoName)

      // Step 2: Get repository structure and content
      setCurrentStep("Récupération de la structure...")
      setProgress(25)

      const contents = await githubAPI.getRepositoryContents(owner, repoName)
      let packageJson = null

      if (analysis.hasPackageJson) {
        try {
          const packageContent = await githubAPI.getFileContent(owner, repoName, "package.json")
          packageJson = JSON.parse(packageContent)
        } catch (error) {
          console.error("Error reading package.json:", error)
        }
      }

      // Step 3: Generate README
      setCurrentStep("Génération du README.md...")
      setProgress(40)

      const readmeContent = await gemini.generateReadme({
        name: repository.name,
        description: repository.description || "",
        language: analysis.mainLanguage,
        fileStructure: analysis.fileStructure,
        packageJson,
      })

      // Step 4: Generate Dockerfile
      setCurrentStep("Création du Dockerfile...")
      setProgress(60)

      const dockerfileContent = await gemini.generateDockerfile({
        name: repository.name,
        language: analysis.mainLanguage,
        packageJson,
        hasPackageJson: analysis.hasPackageJson,
      })

      // Step 5: Generate docker-compose
      setCurrentStep("Configuration Docker Compose...")
      setProgress(75)

      const dockerComposeContent = await gemini.generateDockerCompose({
        name: repository.name,
        language: analysis.mainLanguage,
        needsDatabase: analysis.needsDatabase,
        needsRedis: analysis.needsRedis,
      })

      // Step 6: Generate GitHub Actions
      setCurrentStep("Configuration CI/CD...")
      setProgress(90)

      const cicdContent = await gemini.generateGitHubActions({
        name: repository.name,
        language: analysis.mainLanguage,
        hasTests: analysis.hasTests,
        needsDocker: true,
      })

      setGeneratedFiles({
        readme: readmeContent,
        dockerfile: dockerfileContent,
        dockerCompose: dockerComposeContent,
        cicd: cicdContent,
      })

      setProgress(100)
      setCurrentStep("Génération terminée !")

      toast({
        title: "Documentation générée !",
        description: "Tous les fichiers ont été créés avec l'IA Gemini.",
      })
    } catch (error: any) {
      console.error("Generation error:", error)
      toast({
        title: "Erreur de génération",
        description: error.message || "Une erreur est survenue lors de la génération",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const uploadToGitHub = async () => {
    if (!generatedFiles || Object.keys(generatedFiles).length === 0) {
      toast({
        title: "Aucun fichier à uploader",
        description: "Générez d'abord la documentation",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const [owner, repoName] = repository.full_name.split("/")

    try {
      const filesToUpload = [
        { path: "README.md", content: generatedFiles.readme },
        { path: "Dockerfile", content: generatedFiles.dockerfile },
        { path: "docker-compose.yml", content: generatedFiles.dockerCompose },
        { path: ".github/workflows/ci.yml", content: generatedFiles.cicd },
      ]

      for (const file of filesToUpload) {
        try {
          // Check if file exists to get SHA for update
          let sha = undefined
          try {
            const existingFile = await githubAPI.getFileContent(owner, repoName, file.path)
            if (existingFile) {
              const fileInfo = await githubAPI.request(`/repos/${owner}/${repoName}/contents/${file.path}`)
              sha = fileInfo.sha
            }
          } catch {
            // File doesn't exist, will create new
          }

          await githubAPI.createOrUpdateFile(
            owner,
            repoName,
            file.path,
            file.content,
            `docs: ${sha ? "update" : "add"} ${file.path} via GitDocs Pro`,
            sha,
          )
        } catch (error) {
          console.error(`Error uploading ${file.path}:`, error)
        }
      }

      toast({
        title: "Fichiers uploadés !",
        description: "La documentation a été ajoutée à votre repository GitHub",
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Erreur d'upload",
        description: error.message || "Erreur lors de l'upload vers GitHub",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copié !",
      description: "Le contenu a été copié dans le presse-papiers.",
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{repository.name}</h2>
          <p className="text-slate-600 dark:text-slate-400">Génération de documentation automatique</p>
        </div>
      </div>

      {showApiKeyInput && (
        <Card className="mb-8 border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Configuration Gemini API
            </CardTitle>
            <CardDescription>Entrez votre clé API Gemini pour générer la documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Clé API Gemini</Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Obtenez votre clé API sur{" "}
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
            <Button
              onClick={() => setShowApiKeyInput(false)}
              disabled={!geminiApiKey}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Continuer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Controls */}
      {!showApiKeyInput && (
        <Card className="mb-8 border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Générateur IA Gemini
            </CardTitle>
            <CardDescription>
              Génération automatique de README.md, Dockerfile, docker-compose.yml et CI/CD
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isGenerating && Object.keys(generatedFiles).length === 0 && (
              <Button
                onClick={generateDocumentation}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Générer la documentation
              </Button>
            )}

            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">{currentStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {Object.keys(generatedFiles).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Documentation générée avec succès !</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={uploadToGitHub}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Upload en cours..." : "Upload vers GitHub"}
                  </Button>

                  <Button variant="outline" onClick={() => setShowApiKeyInput(true)}>
                    Changer la clé API
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Files */}
      {Object.keys(generatedFiles).length > 0 && (
        <Tabs defaultValue="readme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="readme" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              README.md
            </TabsTrigger>
            <TabsTrigger value="dockerfile" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Dockerfile
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Docker Compose
            </TabsTrigger>
            <TabsTrigger value="cicd" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              CI/CD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readme">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>README.md</CardTitle>
                  <CardDescription>Documentation principale du projet</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copyToClipboard(generatedFiles.readme)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea value={generatedFiles.readme} readOnly className="min-h-[400px] font-mono text-sm" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dockerfile">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Dockerfile</CardTitle>
                  <CardDescription>Configuration Docker pour la containerisation</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copyToClipboard(generatedFiles.dockerfile)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea value={generatedFiles.dockerfile} readOnly className="min-h-[300px] font-mono text-sm" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>docker-compose.yml</CardTitle>
                  <CardDescription>Orchestration des services Docker</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copyToClipboard(generatedFiles.dockerCompose)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea value={generatedFiles.dockerCompose} readOnly className="min-h-[300px] font-mono text-sm" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cicd">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>.github/workflows/ci.yml</CardTitle>
                  <CardDescription>Pipeline CI/CD GitHub Actions</CardDescription>
                </div>
                <Button variant="outline" onClick={() => copyToClipboard(generatedFiles.cicd)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea value={generatedFiles.cicd} readOnly className="min-h-[400px] font-mono text-sm" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
