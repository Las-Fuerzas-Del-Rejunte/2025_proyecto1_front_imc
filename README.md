Este proyecto fue realizado por los siguientes integrantes:

| Nombre Completo               | Legajo | Email                          |
|------------------------------|--------|--------------------------------|
| Enria, Elian                 | 13235  | elian.enria1@gmail.com         |
| Falco, Gonzalo               | 14238  | gonzafalco@gmail.com           |
| Goti, Franco Nicolás         | 13936  | gotifranco@gmail.com           |
| Gregorutti, Matías           | 13150  | matiasgrego10@gmail.com        |
| Guridi, Ignacio Javier       | 13506  | nacho_g88@hotmail.com          |
| Host, Efraín                 | NN     | hostefrain@gmail.com           |
| Magnano, Nicolás Mauricio    | 14654  | nicomagnano12@gmail.com        |
| Piermarini, Matías Exequiel | 14242  | matiaspiermarini45@gmail.com   |
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
