import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Precisa vir antes do App: configura o i18next e aplica o idioma
// salvo (ou o do navegador) antes do primeiro render, evitando que a
// tela pisque em português para quem escolheu inglês.
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
