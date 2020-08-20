import React from "react"
import { Link } from "react-router-dom"
import "../App.css"

export default function Page404() {

  return (
    <>
      <p>404: ไม่พบข้อมูล</p>
      <Link className="button is-text is-large" to="/">
        กลับไปหน้าแรก
    </Link>
    </>
  )
}