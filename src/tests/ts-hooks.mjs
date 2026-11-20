// Hook nạp module cho unit test (node:test, không thêm gói): đọc alias "@/..." của tsconfig, import không đuôi,
// và dịch .ts bằng typescript có sẵn trong devDependencies (chỉ bỏ kiểu, không kiểm kiểu — kiểm kiểu là việc của tsc).
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = new URL("../../", import.meta.url);
const EXTENSIONS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

const isFile = (url) => statSync(fileURLToPath(url), { throwIfNoEntry: false })?.isFile() ?? false;

// Import không đuôi ("./date", "@/src/shared/utils/date") hoặc trỏ vào thư mục có index.ts
function withExtension(url) {
  if (isFile(url)) return url;
  for (const extension of EXTENSIONS) {
    const candidate = new URL(url.href + extension);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  const isAlias = specifier.startsWith("@/");
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  if ((isAlias || isRelative) && context.parentURL?.startsWith("file:")) {
    const base = isAlias ? new URL(specifier.slice(2), ROOT) : new URL(specifier, context.parentURL);
    const found = withExtension(base);
    if (found) return { url: found.href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith("file:") || !/\.tsx?$/.test(url)) return nextLoad(url, context);
  const source = await readFile(fileURLToPath(url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      sourceMap: false,
    },
  });
  return { format: "module", source: outputText, shortCircuit: true };
}
