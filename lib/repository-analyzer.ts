import type { GitHubAPI } from "./github-api"

export interface RepositoryAnalysis {
  hasReadme: boolean
  hasDockerfile: boolean
  hasDockerCompose: boolean
  hasGitHubActions: boolean
  hasPackageJson: boolean
  hasTests: boolean
  languages: Record<string, number>
  fileStructure: string[]
  packageJson?: any
  mainLanguage: string
  completionScore: number
  needsDatabase: boolean
  needsRedis: boolean
}

export class RepositoryAnalyzer {
  private github: GitHubAPI

  constructor(github: GitHubAPI) {
    this.github = github
  }

  async analyzeRepository(owner: string, repo: string): Promise<RepositoryAnalysis> {
    try {
      // Get repository contents
      const contents = await this.github.getRepositoryContents(owner, repo)
      const fileNames = contents.map((file) => file.name.toLowerCase())

      // Check for important files
      const hasReadme = fileNames.some((name) => name.startsWith("readme"))
      const hasDockerfile = fileNames.includes("dockerfile")
      const hasDockerCompose = fileNames.some((name) => name.includes("docker-compose") || name.includes("compose"))
      const hasPackageJson = fileNames.includes("package.json")

      // Check for GitHub Actions
      let hasGitHubActions = false
      try {
        const githubDir = await this.github.getRepositoryContents(owner, repo, ".github/workflows")
        hasGitHubActions = Array.isArray(githubDir) && githubDir.length > 0
      } catch {
        hasGitHubActions = false
      }

      // Check for tests
      const hasTests = fileNames.some(
        (name) => name.includes("test") || name.includes("spec") || name === "__tests__" || name === "tests",
      )

      // Get languages
      const languages = await this.github.getRepositoryLanguages(owner, repo)
      const mainLanguage = Object.keys(languages)[0] || "Unknown"

      // Get package.json if exists
      let packageJson = null
      if (hasPackageJson) {
        try {
          const packageContent = await this.github.getFileContent(owner, repo, "package.json")
          packageJson = JSON.parse(packageContent)
        } catch {
          // Ignore errors
        }
      }

      // Analyze dependencies for database/redis needs
      const needsDatabase = this.checkNeedsDatabase(packageJson, fileNames)
      const needsRedis = this.checkNeedsRedis(packageJson, fileNames)

      // Calculate completion score
      const completionScore = this.calculateCompletionScore({
        hasReadme,
        hasDockerfile,
        hasDockerCompose,
        hasGitHubActions,
        hasTests,
      })

      return {
        hasReadme,
        hasDockerfile,
        hasDockerCompose,
        hasGitHubActions,
        hasPackageJson,
        hasTests,
        languages,
        fileStructure: contents.map((file) => file.name),
        packageJson,
        mainLanguage,
        completionScore,
        needsDatabase,
        needsRedis,
      }
    } catch (error) {
      console.error("Error analyzing repository:", error)
      throw error
    }
  }

  private checkNeedsDatabase(packageJson: any, fileNames: string[]): boolean {
    if (!packageJson?.dependencies) return false

    const dbDependencies = ["mongoose", "mongodb", "pg", "mysql2", "sqlite3", "sequelize", "typeorm", "prisma", "knex"]

    return (
      Object.keys(packageJson.dependencies).some((dep) => dbDependencies.some((dbDep) => dep.includes(dbDep))) ||
      fileNames.some((name) => name.includes("database") || name.includes("db") || name.includes("schema"))
    )
  }

  private checkNeedsRedis(packageJson: any, fileNames: string[]): boolean {
    if (!packageJson?.dependencies) return false

    return Object.keys(packageJson.dependencies).some((dep) => dep.includes("redis") || dep.includes("ioredis"))
  }

  private calculateCompletionScore(checks: {
    hasReadme: boolean
    hasDockerfile: boolean
    hasDockerCompose: boolean
    hasGitHubActions: boolean
    hasTests: boolean
  }): number {
    const weights = {
      hasReadme: 30,
      hasDockerfile: 20,
      hasDockerCompose: 15,
      hasGitHubActions: 25,
      hasTests: 10,
    }

    let score = 0
    Object.entries(checks).forEach(([key, value]) => {
      if (value) {
        score += weights[key as keyof typeof weights]
      }
    })

    return score
  }
}
