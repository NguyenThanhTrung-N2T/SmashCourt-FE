// Chạy unit test FE: npm test. Dùng node:test có sẵn trong Node (CI Node 20), không thêm gói.
// Tìm mọi src/tests/**/*.test.ts rồi nạp trong cùng tiến trình; node:test tự chạy và trả mã thoát khác 0 nếu có ca hỏng.
import { readdirSync } from "node:fs";
import { register } from "node:module";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

register("./ts-hooks.mjs", import.meta.url);

const testsDir = fileURLToPath(new URL(".", import.meta.url));
const files = readdirSync(testsDir, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

if (files.length === 0) {
  console.error("Không tìm thấy file *.test.ts trong src/tests");
  process.exit(1);
}

for (const file of files) {
  console.log(`# ${relative(process.cwd(), join(testsDir, file))}`);
  await import(pathToFileURL(join(testsDir, file)).href);
}
