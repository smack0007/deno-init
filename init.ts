import * as colors from "std/fmt/colors.ts";
import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";

const scriptURL = new URL(import.meta.url);
const scriptURLString = scriptURL.toString();
const sourceURLIsFileUrl = scriptURL.toString().startsWith("file://");

function joinPath(source: string | URL, fileName: string): string | URL {
  let result: string | URL;

  if (typeof source === "string") {
    result = path.join(source, fileName);
  } else {
    result = new URL(fileName, source);
  }

  if (typeof result === "string" && sourceURLIsFileUrl) {
    result = new URL(`file://${result}`);
  }

  return result;
}

const source = sourceURLIsFileUrl
  ? path.dirname(path.fromFileUrl(scriptURL))
  : new URL(
      scriptURLString.substring(0, scriptURLString.length - "init.ts".length)
    );
const destination = path.resolve(Deno.args[0] ?? ".");

const projectName = destination.split(path.SEP).at(-1) as string;
console.info(`Initializing ${colors.yellow(projectName)}`);

const DIRECTORIES_TO_CREATE = [".vscode", "src"];

const FILES_TO_COPY = [
  path.join(".vscode", "settings.json"),
  path.join("src", "main.ts"),
  ".gitignore",
  "deno.jsonc",
  "imports.jsonc",
];

for (const directory of DIRECTORIES_TO_CREATE) {
  await fs.ensureDir(path.join(destination, directory));
}

for (const file of FILES_TO_COPY) {
  try {
    await fs.copy(joinPath(source, file), joinPath(destination, file), {
      overwrite: false,
    });
    console.info(colors.green(`Wrote ${path.join(destination, file)}.`));
  } catch (error) {
    if (error instanceof Deno.errors.AlreadyExists) {
      console.error(
        colors.red(`${path.join(destination, file)} already exists.`)
      );
    } else {
      console.error(
        colors.red(`Failed to write ${path.join(destination, file)}`),
        error
      );
    }
  }
}

try {
  await Deno.writeTextFile(
    path.join(destination, "Readme.md"),
    `# ${projectName}\n`
  );
  console.info(colors.green(`Wrote ${path.join(destination, "Readme.md")}.`));
} catch (error) {
  if (error instanceof Deno.errors.AlreadyExists) {
    console.error(
      colors.red(`${path.join(destination, "Readme.md")} already exists.`)
    );
  } else {
    console.error(
      colors.red(`Failed to write ${path.join(destination, "Readme.md")}`),
      error
    );
  }
}
