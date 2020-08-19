import React from 'react'
import logo from '../logo.svg';
import '../App.css';

export default function About({ liff }) {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <ul>
        <li>Language: {liff.getLanguage()}</li>
        <li>LIFF Version: {liff.getVersion()}</li>
        <li>LINE Version: {liff.getLineVersion() || '-'}</li>
        <li>In client: {liff.isInClient() ? 'Yes' : 'No'}</li>
        <li>OS: {liff.getOS()}</li>
      </ul>
    </div>
  )
}