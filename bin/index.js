#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

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
    require('child_process').execSync('npm init -y', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error running npm init -y:', err);
    process.exit(1);
  }

  // 5) Update package.json with dependencies, devDependencies, and scripts
  console.log('\nUpdating package.json with dependencies and scripts...');
  const packageJsonPath = path.join(projectPath, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Set dependencies and devDependencies manually
  packageJson.dependencies = {
    "express": "5.0.1",
    "cors": "*",
    "morgan": "*",
    "dotenv": "*",
    "mongoose": "*",
    "ejs":"*"
  };

  packageJson.devDependencies = {
    "typescript": "*",
    "@types/node": "*",
    "@types/express": "*",
    "@types/cors": "*",
    "@types/morgan": "*",
    "@types/ejs":"*",
    "nodemon": "*",
    "ts-node": "*"
  };

  // Update scripts
  packageJson.scripts = {
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "dev": "nodemon --watch src/**/*.ts --exec \"npx ts-node src/index.ts\""
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 6) Create tsconfig.json with custom configuration
  console.log('\nCreating tsconfig.json...');
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

  // 7) Create src directory and index.ts
  console.log('\nCreating source files...');
  const srcDir = path.join(projectPath, 'src');
  fs.mkdirSync(srcDir);
  const indexTsPath = path.join(srcDir, 'index.ts');
  const indexTsContent = `import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

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

  // 8) Create nodemon.json
  console.log('\nCreating nodemon.json...');
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
  2) Run "npm install" to install all dependencies.
  3) Run "npm run dev" to start the development server.
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
