import React from 'react'
import logo from '../logo.png';
import '../App.css';
import { version } from "../../package.json"

export default function Help({ liff }) {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <div
  style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
>
  <div style={{flex: 1, height: '1px', backgroundColor: 'black'}} />

  <div>
    <p style={{width: '70px', textAlign: 'center'}}>Download</p>
  </div>

  <div style={{flex: 1, height: '1px', backgroundColor: 'black'}} />
</div>
       <ul>
        <li><a href={`${process.env.PUBLIC_URL}/01_Manual.pdf`}>Download Manual</a></li>
        <li><a href={`${process.env.PUBLIC_URL}/02_Pick_up_points.pdf`}>Download Pick-up points</a></li>
        </ul>
        <div
  style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
>
  <div style={{flex: 1, height: '1px', backgroundColor: 'black'}} />

  <div>
    <p style={{width: '70px', textAlign: 'center'}}>Application Information</p>
  </div>

  <div style={{flex: 1, height: '1px', backgroundColor: 'black'}} />
</div>
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