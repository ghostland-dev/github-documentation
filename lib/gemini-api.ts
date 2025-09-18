interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export class GeminiAPI {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateContent(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }))
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    const data: GeminiResponse = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || ""
  }

  async generateReadme(repoData: {
    name: string
    description: string
    language: string
    fileStructure: string[]
    packageJson?: any
  }): Promise<string> {
    const prompt = `
Génère un README.md professionnel et complet pour ce projet GitHub :

Nom du projet: ${repoData.name}
Description: ${repoData.description || "Pas de description"}
Langage principal: ${repoData.language}
Structure des fichiers: ${repoData.fileStructure.join(", ")}
${repoData.packageJson ? `Package.json: ${JSON.stringify(repoData.packageJson, null, 2)}` : ""}

Le README doit inclure :
1. Un titre accrocheur avec badges
2. Une description claire du projet
3. Les fonctionnalités principales
4. Instructions d'installation
5. Guide d'utilisation
6. Structure du projet
7. Technologies utilisées
8. Contribution
9. Licence

Utilise un format Markdown professionnel avec des emojis appropriés.
`

    return this.generateContent(prompt)
  }

  async generateDockerfile(repoData: {
    name: string
    language: string
    packageJson?: any
    hasPackageJson: boolean
  }): Promise<string> {
    const prompt = `
Génère un Dockerfile optimisé pour ce projet :

Nom: ${repoData.name}
Langage: ${repoData.language}
${repoData.hasPackageJson ? "Le projet utilise Node.js/npm" : ""}
${repoData.packageJson ? `Dependencies: ${Object.keys(repoData.packageJson.dependencies || {}).join(", ")}` : ""}

Le Dockerfile doit :
1. Utiliser une image de base appropriée
2. Optimiser les layers pour le cache
3. Inclure les bonnes pratiques de sécurité
4. Exposer les ports nécessaires
5. Utiliser un utilisateur non-root si possible
6. Être optimisé pour la production
`

    return this.generateContent(prompt)
  }

  async generateDockerCompose(repoData: {
    name: string
    language: string
    needsDatabase: boolean
    needsRedis: boolean
  }): Promise<string> {
    const prompt = `
Génère un fichier docker-compose.yml pour ce projet :

Nom: ${repoData.name}
Langage: ${repoData.language}
Besoin d'une base de données: ${repoData.needsDatabase ? "Oui" : "Non"}
Besoin de Redis: ${repoData.needsRedis ? "Oui" : "Non"}

Le docker-compose doit inclure :
1. Le service principal de l'application
2. ${repoData.needsDatabase ? "Un service de base de données (PostgreSQL ou MongoDB selon le contexte)" : ""}
3. ${repoData.needsRedis ? "Un service Redis" : ""}
4. Les volumes appropriés
5. Les variables d'environnement
6. Les réseaux si nécessaire
7. Les healthchecks
`

    return this.generateContent(prompt)
  }

  async generateGitHubActions(repoData: {
    name: string
    language: string
    hasTests: boolean
    needsDocker: boolean
  }): Promise<string> {
    const prompt = `
Génère un workflow GitHub Actions (.github/workflows/ci.yml) pour ce projet :

Nom: ${repoData.name}
Langage: ${repoData.language}
A des tests: ${repoData.hasTests ? "Oui" : "Non"}
Utilise Docker: ${repoData.needsDocker ? "Oui" : "Non"}

Le workflow doit inclure :
1. Déclenchement sur push et pull request
2. Jobs pour différentes versions de Node.js/Python selon le langage
3. Installation des dépendances
4. ${repoData.hasTests ? "Exécution des tests" : "Linting du code"}
5. ${repoData.needsDocker ? "Build et push de l'image Docker" : ""}
6. Déploiement automatique sur la branche main
7. Notifications en cas d'échec
`

    return this.generateContent(prompt)
  }
}
