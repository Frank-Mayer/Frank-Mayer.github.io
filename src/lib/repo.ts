export type Repo = {
    name: string
    description: string
    url: string
    langs: Array<string>
    latestUpdate: number
}

function latestDate(...dates: Array<string>): number {
    return Math.max(...dates.map((date) => Date.parse(date)))
}

function getHtmlData(): Array<Repo> {
    // is in browser?
    if (typeof window === "undefined") {
        return new Array<Repo>()
    }

    // get data from html
    const prefetchedReposEl = window.document.getElementById(
        "prefetched-repos",
    ) as HTMLInputElement | null
    if (!prefetchedReposEl) {
        return new Array<Repo>()
    }

    if (!prefetchedReposEl.value) {
        return new Array<Repo>()
    }

    const prefetchedRepos = JSON.parse(prefetchedReposEl.value)

    // check if data is valid
    if (!Array.isArray(prefetchedRepos)) {
        return new Array<Repo>()
    }

    return prefetchedRepos
}

export async function fetchRepos(): Promise<Array<Repo>> {
    const data = new Array<Repo>()

    const minDate = Date.now() - 1000 * 60 * 60 * 24 * 30 // 30 days

    try {
        const response = await fetch(
            "https://api.github.com/users/Frank-Mayer/repos",
        )

        if (!response.ok) {
            console.error(`Error ${response.status}: ${response.statusText}`)
            return data
        }

        const apiRepos = await response.json()

        for (const apiRepo of apiRepos) {
            const latestUpdate = latestDate(
                apiRepo.created_at,
                apiRepo.updated_at,
                apiRepo.pushed_at,
            )

            if (latestUpdate < minDate) {
                continue
            }

            const daraRepo: Repo = {
                name: apiRepo.full_name,
                description: apiRepo.description ?? "",
                url: apiRepo.html_url,
                langs: new Array<string>(),
                latestUpdate,
            }

            try {
                const langResp = await fetch(apiRepo.languages_url)
                if (langResp.ok) {
                    const apiLangs = await langResp.json()
                    daraRepo.langs = Object.keys(apiLangs)
                }
            } finally {
                data.push(daraRepo)
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error)
    } finally {
        if (data.length === 0) {
            return getHtmlData()
        }

        // Sort by latest update
        data.sort((a, b) => b.latestUpdate - a.latestUpdate)

        // only return the first 6 repos
        return data.slice(0, 6)
    }
}
