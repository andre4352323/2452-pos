import * as fs from "fs";
import * as readline from "readline";

const STATES = ["a","b","c","d","e","f","g","h","i","j"];
const N = STATES.length;
const counts: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));

const rl = readline.createInterface({ input: fs.createReadStream("training.csv") });

rl.on("line", (line) => {
    
    const symbols = line.split(",");
    for (let k = 0; k < symbols.length - 1; k++) {

        const from = STATES.indexOf(symbols[k]);
        const to = STATES.indexOf(symbols[k + 1]);
        if (from !== -1 && to !== -1) counts[from][to]++;
    }
});

rl.on("close", () => {
    const rows = counts.map(row => {

        const total = row.reduce((a, b) => a + b, 0);
        return row.map(v => v / total).join(",");
    });

    fs.writeFileSync("model.csv", rows.join("\n"));
});