import { Switch, Match, For, createSignal } from "solid-js"
import { fetchRepos, type Repo } from "../../lib/repo"
import { mapEmotes } from "../../lib/emote"
import { escapeHtml } from "../../lib/html"

export function Recent() {
    const [arr, setArr] = createSignal<Array<Repo>>([])

    const fetchData = async () => {
        const data = await fetchRepos()
        setArr(data)
    }

    fetchData()

    return (
        <div>
            <Switch>
                <Match when={arr().length > 0}>
                    <For each={arr()}>
                        {(item) => (
                            <a href={item.url}>
                                <h3
                                    innerHTML={escapeHtml(mapEmotes(item.name))}
                                ></h3>
                                <p
                                    innerHTML={escapeHtml(
                                        mapEmotes(item.description),
                                    )}
                                ></p>
                                <p>
                                    Last updated:{" "}
                                    {new Date(item.latestUpdate).toDateString()}
                                </p>
                            </a>
                        )}
                    </For>
                </Match>
                <Match when={arr().length === 0}>
                    <p>loading...</p>
                </Match>
            </Switch>
        </div>
    )
}

export default Recent
