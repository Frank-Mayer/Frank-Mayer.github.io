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
        <div class="list">
            <Switch>
                <Match when={arr().length > 0}>
                    <For each={arr()}>
                        {(item) => (
                            <a class="list__item" href={item.url}>
                                <h3
                                    innerHTML={escapeHtml(mapEmotes(item.name))}
                                ></h3>
                                <p
                                    innerHTML={escapeHtml(
                                        mapEmotes(item.description),
                                    )}
                                ></p>
                                <table>
                                    <tr>
                                        <td>Last updated</td>
                                        <td>{new Date(item.latestUpdate).toDateString()}</td>
                                    </tr>
                                    <tr>
                                        <td>Languages</td>
                                        <td>{item.langs.join(", ")}</td>
                                    </tr>
                                </table>
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
