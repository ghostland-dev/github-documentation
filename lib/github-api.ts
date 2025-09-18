interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
  private: boolean
}

interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: string
  content?: string
  encoding?: string
}

export class GitHubAPI {
  private token: string
  private baseUrl = "https://api.github.com"

  constructor(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getUser() {
    return this.request("/user")
  }

  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    const repos = await this.request(`/users/${username}/repos?sort=updated&per_page=100`)
    return repos.filter((repo: any) => !repo.fork) // Exclude forks
  }

  async getRepositoryContents(owner: string, repo: string, path = ""): Promise<GitHubFile[]> {
    return this.request(`/repos/${owner}/${repo}/contents/${path}`)
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const file = await this.request(`/repos/${owner}/${repo}/contents/${path}`)
    if (file.content && file.encoding === "base64") {
      return atob(file.content.replace(/\n/g, ""))
    }
    throw new Error("Unable to decode file content")
  }

  async createOrUpdateFile(owner: string, repo: string, path: string, content: string, message: string, sha?: string) {
    const body: any = {
      message,
      content: btoa(content),
    }

    if (sha) {
      body.sha = sha
    }

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async checkFileExists(owner: string, repo: string, path: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}/contents/${path}`)
      return true
    } catch {
      return false
    }
  }

  async getRepositoryLanguages(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}/languages`)
  }

  async getRepositoryCommits(owner: string, repo: string, per_page = 10) {
    return this.request(`/repos/${owner}/${repo}/commits?per_page=${per_page}`)
  }
}
