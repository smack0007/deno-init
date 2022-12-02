import * as colors from "std/fmt/colors.ts";
import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";

const scriptURL = new URL(import.meta.url);
const scriptURLString = scriptURL.toString();
const isFileURL = scriptURL.toString().startsWith("file://");

const source = isFileURL
  ? path.dirname(path.fromFileUrl(scriptURL))
  : scriptURLString.substring(0, scriptURLString.length - "init.ts".length);
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
    await fs.copy(path.join(source, file), path.join(destination, file), {
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
