import { Switch, Match, For, createSignal } from "solid-js"
import { fetchRepos, type Repo } from "../../lib/repo"

export function Recent() {
    const [arr, setArr] = createSignal<Array<Repo>>([])

    const fetchData = async () => {
        const data = await fetchRepos()
        setArr(data)
    }

    fetchData()

    return (
        <Switch fallback={<div>loading...</div>}>
            <Match when={arr.length > 0}>
                <ul>
                    <For each={arr()}>
                        {(repo: Repo) => <li>{repo.name}</li>}
                    </For>
                </ul>
            </Match>
        </Switch>
    )
}

export default Recent
