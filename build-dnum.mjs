import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import stripJsonComments from 'strip-json-comments';

execSync('rm -rf dnum', { stdio: 'inherit' });
execSync('git clone --depth 1 https://github.com/bpierre/dnum.git', { stdio: 'inherit' });

{
  const packageJson = JSON.parse(readFileSync("dnum/package.json"));

  packageJson.name = "dnum-cjs";
  packageJson.homepage = "https://github.com/caoer/npm-cjs.git";
  packageJson.repository ={
    "type": "git",
    "url": "git+https://github.com/caoer/npm-cjs.git"
  };
  packageJson.type = "commonjs";

  delete packageJson['module'];
  packageJson.main = "dist/dnum-cjs.js";

  console.log("package.json", packageJson);
  writeFileSync(
    "dnum/package.json",
    JSON.stringify(packageJson, undefined, "\t")
  );
}

{
  const viteConfig = readFileSync("dnum/vite.config.ts", 'utf-8');
  writeFileSync('dnum/vite.config.ts', viteConfig.replace(`formats: [\"es\"]`, `formats: [\"cjs\"]`));
}

{
  const jsonText = stripJsonComments(readFileSync("dnum/tsconfig.json", "utf-8"), {trailingCommas: true})
  const tsconfigJson = JSON.parse(jsonText);

  tsconfigJson.compilerOptions.module = "commonjs";
  tsconfigJson.compilerOptions.target = "es2020";
  tsconfigJson.compilerOptions.esModuleInterop = true;
  tsconfigJson.compilerOptions.moduleResolution = "node";

  console.log("tsconfig.json", tsconfigJson);

  writeFileSync(
    "dnum/tsconfig.json",
    JSON.stringify(tsconfigJson, undefined, "\t")
  );
}

execSync('npm install', { cwd: 'dnum', stdio: 'inherit' });
execSync('npm run build', { cwd: 'dnum', stdio: 'inherit' });

execSync(`node -e "console.log(require('./dnum'))"`, { stdio: 'inherit' });
