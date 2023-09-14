import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import { Octokit } from "octokit"

export type Repo = {
    name: string
    description: string
    url: string
    stars: number
    forks: number
    languages: string[]
    avatar: string | null
}

const apiVersion = "2022-11-28"

const defaultApiHeaders = {
    accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": apiVersion,
} as const

const cacheFileName = "./gh_cache.json"

export const octokit = new Octokit({
    auth: process.env.PAT,
})

export async function getProfile() {
    const apiProfileResp = await octokit.request("GET /users/{username}", {
        username: "Frank-Mayer",
        headers: defaultApiHeaders,
    })

    if (apiProfileResp.status !== 200) {
        throw new Error("Failed to fetch profile")
    }

    return {
        name: apiProfileResp.data.login,
        bio: apiProfileResp.data.bio,
        location: apiProfileResp.data.location,
        avatar: apiProfileResp.data.avatar_url,
        url: apiProfileResp.data.html_url,
    } as const
}

export async function getRepos(): Promise<Array<Repo>> {
    if (existsSync(cacheFileName)) {
        console.debug("Using cached repos")
        return JSON.parse((await readFile(cacheFileName)).toString())
    }

    console.debug("Fetching repos")

    const apiReposResp = await octokit.request(
        "GET /users/Frank-Mayer/repos?tgetProfileypeeall&sort=updated&direction=desc",
        {
            headers: defaultApiHeaders,
        },
    )

    if (apiReposResp.status !== 200) {
        throw new Error("Failed to fetch repos")
    }

    const repos = new Array<Repo>()

    for (const apiRepo of apiReposResp.data) {
        // ignore archives
        if (apiRepo.archived) {
            continue
        }

        // if forked, use parent repo
        if (apiRepo.fork) {
            await addParentRepo(repos, apiRepo)
            continue
        }

        await addRepo(repos, apiRepo)
    }

    await writeFile(cacheFileName, JSON.stringify(repos))

    return repos
}

async function addParentRepo(repos: Repo[], apiRepo: any) {
    console.debug(`Fetching parent repo for ${apiRepo.full_name}`, apiRepo)
    const apiParentRepoResp = await octokit.request(
        "GET /repos/{owner}/{repo}",
        {
            owner: apiRepo.owner.login,
            repo: apiRepo.name,
            headers: defaultApiHeaders,
        },
    )

    if (apiParentRepoResp.status !== 200) {
        throw new Error(`Failed to fetch parent repo for ${apiRepo.full_name}`)
    }

    if (!apiParentRepoResp.data.parent) {
        throw new Error(
            `Failed to fetch parent repo for ${apiRepo.full_name} (no parent)`,
        )
    }

    const parent = apiParentRepoResp.data.parent

    repos.push({
        name: parent.full_name,
        description: parent.description ?? "",
        url: parent.html_url,
        stars:
            apiParentRepoResp.data.stargazers_count + parent.stargazers_count,
        forks: apiParentRepoResp.data.forks_count + parent.forks_count,
        languages: await getRepoLangs(
            apiParentRepoResp.data.owner.login,
            apiParentRepoResp.data.name,
        ),
        avatar: parent.owner.login === "Frank-Mayer" ? null : parent.owner.avatar_url,
    })
}

async function addRepo(repos: Repo[], apiRepo: any) {
    repos.push({
        name: apiRepo.full_name,
        description: apiRepo.description ?? "",
        url: apiRepo.html_url,
        stars: apiRepo.stargazers_count,
        forks: apiRepo.forks_count,
        languages: await getRepoLangs(apiRepo.owner.login, apiRepo.name),
        avatar: apiRepo.owner.login === "Frank-Mayer" ? null : apiRepo.apiRepo.owner.avatar_url,
    })
}

async function getRepoLangs(
    owner: string,
    repo: string,
): Promise<Array<string>> {
    const apiLangsResp = await octokit.request(
        "GET /repos/{owner}/{repo}/languages",
        {
            owner,
            repo,
            headers: defaultApiHeaders,
        },
    )

    if (apiLangsResp.status !== 200) {
        throw new Error(`Failed to fetch languages for ${owner}/${repo}`)
    }

    return Object.keys(apiLangsResp.data)
        .map(
            (lang) =>
                ({
                    name: lang,
                    bytes: apiLangsResp.data[lang],
                }) as const,
        )
        .filter((x) => x.bytes)
        .sort((a, b) => b.bytes! - a.bytes!)
        .map((lang) => lang.name)
}
