const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando sintaxis de archivos JavaScript...");

function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        results = results.concat(getJsFiles(fullPath));
      }
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

const rootDir = path.resolve(__dirname, "..");
const jsFiles = getJsFiles(rootDir);

for (const file of jsFiles) {
  try {
    execSync(`node --check "${file}"`, { stdio: "pipe" });
  } catch (err) {
    console.error(`❌ Error de sintaxis en: ${file}`);
    process.exit(1);
  }
}

console.log(`✅ Sintaxis válida en ${jsFiles.length} archivos.`);

// Verificar que app.js cargue sin errores
try {
  const app = require("../app");
  if (!app) {
    throw new Error("No se pudo instanciar la aplicación Express");
  }
  console.log("✅ app.js cargó correctamente en memoria.");
} catch (err) {
  console.error("❌ Error al cargar app.js:", err.message);
  process.exit(1);
}

console.log("🎉 Todas las verificaciones pasaron satisfactoriamente.");
