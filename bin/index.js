#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createProject(projectName) {
  const projectPath = path.join(process.cwd(), projectName);

  // 1) Check if folder already exists
  if (fs.existsSync(projectPath)) {
    console.error(`Error: Folder "${projectName}" already exists in this directory.`);
    process.exit(1);
  }

  // 2) Create project directory
  try {
    fs.mkdirSync(projectPath);
  } catch (err) {
    console.error(`Error creating folder "${projectName}":`, err);
    process.exit(1);
  }

  // 3) Navigate into the project folder
  process.chdir(projectPath);

  // 4) Initialize package.json
  console.log('Initializing package.json...');
  try {
    execSync('npm init -y', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error running npm init -y:', err);
    process.exit(1);
  }

  // 5) Install dependencies
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install express@5.0.1 cors morgan dotenv mongoose', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error installing dependencies:', err);
    process.exit(1);
  }

  // 6) Install dev dependencies
  console.log('\nInstalling dev dependencies...');
  try {
    execSync('npm install -D typescript @types/node @types/express @types/cors @types/morgan nodemon', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error installing dev dependencies:', err);
    process.exit(1);
  }

  // 7) Initialize TypeScript configuration
  console.log('\nInitializing TypeScript configuration...');
  try {
    execSync('npx tsc --init', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error running tsc --init:', err);
    process.exit(1);
  }

  // 8) Overwrite tsconfig.json
  const tsConfigPath = path.join(projectPath, 'tsconfig.json');
  const tsConfigContent = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
`;
  fs.writeFileSync(tsConfigPath, tsConfigContent);

  // 9) Create src directory and index.ts
  const srcDir = path.join(projectPath, 'src');
  fs.mkdirSync(srcDir);
  const indexTsPath = path.join(srcDir, 'index.ts');
  const indexTsContent = `import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Routes go here
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript scaffold!');
});

app.listen(port, () => {
  console.log(\`Server is running on http://localhost:\${port}\`);
});
`;
  fs.writeFileSync(indexTsPath, indexTsContent);

  // 10) Update package.json with scripts
  const packageJsonPath = path.join(projectPath, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    ...packageJson.scripts,
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "dev": "nodemon --watch src/**/*.ts --exec \"npx ts-node src/index.ts\""
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 11) Create nodemon.json
  const nodemonPath = path.join(projectPath, 'nodemon.json');
  const nodemonContent = `{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
   "exec": "npx ts-node ./src/index.ts"
}
`;
  fs.writeFileSync(nodemonPath, nodemonContent);

  console.log('\n✅ Project setup complete!');
  console.log(`\nNext steps:
  1) cd ${projectName}
  2) npm run dev
`);
}

program
  .name('adep')
  .description('CLI to scaffold a new TypeScript + Express project.')
  .version('1.2.0');

program
  .command('new <project-name>')
  .description('Create a new TypeScript + Express project.')
  .action((projectName) => {
    createProject(projectName);
  });

program.parse(process.argv);
