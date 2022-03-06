import { signIn } from 'next-auth/client'
import Link from 'next/link'


export default function AccessDenied () {
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a href="/api/auth/login">Login</a>
      </p>
    </>
  )
}
