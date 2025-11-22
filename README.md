A guide on how to get started with the project 


1. Before you start you need Node.js installed on your computer. You can download it here: https://nodejs.org/


2. In VS Code, add the Live Share extension for collaborative coding (optional). 


3. Choose a folder for your project. Decide where you want the project to live on your computer. For example, on your desktop. This is where the project files will be saved. 


4. Open your terminal. On Mac: Press Cmd + Space, type “Terminal”, and press Enter. On Windows: Press the Windows key, type “Command Prompt” or “PowerShell”, and open it.


5. In the terminal, type the command to go to your chosen folder. For example, to go to your desktop you write: cd ~/Desktop 
On windows it might look like this: cd %USERPROFILE%\Desktop


6. Now clone the project from GitHub using the project's repository URL https://github.com/TheresePaulsen/Dykon.git . In the terminal type: git clone https://github.com/TheresePaulsen/Dykon.git 
This will create a new folder with the project files in your chosen location. 


7. Change directory into the new project folder. So you write in the terminal: cd [directory_path] . Replace [directory_path] with the actual folder name. 
E.g.: cd ~/Desktop/project 


8. Install project dependencies. In the terminal, type: npm install
This command downloads and sets up everything the project needs to run. 


9. To start the development server, in the terminal, type: npm run dev
The terminal will show a local address (like http://localhost:5173).
Open this address in your web browser to see the app running.






___________________________________________________________________________________________

This section below covers the project's configuration, including the plugins used for React development with Vite, such as @vitejs/plugin-react and @vitejs/plugin-react-swc. It also discusses the React Compiler and provides guidance on configuring ESLint for type-aware linting in production applications.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```






