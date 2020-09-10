import React from 'react'
import logo from '../logo.svg';
import '../App.css';
import { version } from "../../package.json"

export default function Help({ liff }) {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <ul>
        <li>LIFF app version: {version}</li>
        <li>Language: {liff.getLanguage()}</li>
        <li>LIFF version: {liff.getVersion()}</li>
        <li>LINE version: {liff.getLineVersion() || '-'}</li>
        <li>In client: {liff.isInClient() ? 'Yes' : 'No'}</li>
        <li>OS: {liff.getOS()}</li>
      </ul>
    </div>
  )
}