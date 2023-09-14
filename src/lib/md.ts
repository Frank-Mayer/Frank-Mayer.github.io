import { Converter } from "showdown";

const converter = new Converter();
converter.setFlavor("github");
converter.setOption("simpleLineBreaks", true);

export function md(markdown: string): string {
    return converter.makeHtml(markdown);
}
