# ADEP CLI

ADEP is a command-line tool to scaffold a new TypeScript + Express project. It’s designed to work seamlessly on both macOS and Windows without requiring any global packages—everything is self-contained within your project.

## Features

- **Cross-Platform:** Works on macOS and Windows.
- **Self-Contained:** No need to install global packages like `ts-node`.
- **Quick Setup:** Automatically creates a new project folder, initializes `package.json`, installs dependencies, and sets up a basic Express server with TypeScript.
- **Development Ready:** Comes with pre-configured scripts for development with live reload using nodemon.

## Requirements

- **Node.js** (v12 or higher is recommended)
- **npm** (comes bundled with Node.js)

## Installation

You have two options to use ADEP:

### Option 1: Use with `npx`

Run the CLI directly without installing it globally:

```bash
npx adep new my-project
