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
                            <a
                                class="list__item"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h3
                                    innerHTML={escapeHtml(mapEmotes(item.name))}
                                ></h3>
                                <p
                                    innerHTML={escapeHtml(
                                        mapEmotes(item.description),
                                    )}
                                ></p>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Last updated:&nbsp;</td>
                                            <td>
                                                {new Date(
                                                    item.latestUpdate,
                                                ).toDateString()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Languages:&nbsp;</td>
                                            <td>{item.langs.join(", ")}</td>
                                        </tr>
                                    </tbody>
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
